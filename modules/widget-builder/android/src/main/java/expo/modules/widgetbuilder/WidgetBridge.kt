package expo.modules.widgetbuilder

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProviderInfo
import android.content.ComponentName
import android.content.Context
import android.widget.RemoteViews
import androidx.glance.appwidget.updateAll
import androidx.work.Data
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class WidgetBridge : Module() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    companion object {
        @JvmStatic
        fun handlePushData(context: Context, data: Map<String, String>) {
            if (data["action"] != "UPDATE_WIDGET") return

            val targetSlot = data["widgetId"]
            val inputData  = if (targetSlot != null)
                Data.Builder().putString("widgetId", targetSlot).build()
            else Data.EMPTY

            WorkManager.getInstance(context)
                .enqueue(OneTimeWorkRequestBuilder<WidgetUpdateWorker>()
                    .setInputData(inputData)
                    .build())
        }
    }

    override fun definition() = ModuleDefinition {
        Name("WidgetBridge")

        AsyncFunction("saveWidgetSchema") { json: String, widgetId: String ->
            val context = appContext.reactContext ?: throw Exception("React context not available")

            try {
                val index = SlotRegistry.getOrAssignSlot(context, widgetId)
                    ?: throw Exception("E_WIDGET_FULL: All ${SlotRegistry.MAX_SLOTS} slots are in use")

                val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)
                prefs.edit().putString("widget_schema_$widgetId", json).commit()

                SlotRegistry.enableSlot(context, index)

                WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                    "widget_refresh_$widgetId",
                    ExistingPeriodicWorkPolicy.UPDATE,
                    PeriodicWorkRequestBuilder<WidgetUpdateWorker>(15, TimeUnit.MINUTES)
                        .setInputData(Data.Builder().putString("widgetId", widgetId).build())
                        .build()
                )

                scope.launch {
                    val widget        = SlotRegistry.getWidget(index)        ?: return@launch
                    val receiverClass = SlotRegistry.getReceiverClass(index) ?: return@launch

                    widget.updateAll(context)

                    if (android.os.Build.VERSION.SDK_INT >= 36) {
                        updateWidgetPreview(context, widgetId, json, receiverClass)
                    }
                }

                "success"
            } catch (e: Exception) {
                throw Exception("E_WIDGET_ERROR [$widgetId]: ${e.message}")
            }
        }

        AsyncFunction("writeWidgetData") { data: Map<String, Any>, widgetId: String ->
            val context = appContext.reactContext ?: throw Exception("React context not available")

            try {
                val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)

                val existing    = prefs.getString("widget_remote_data_$widgetId", "{}") ?: "{}"
                val existingObj = org.json.JSONObject(existing)

                for ((key, value) in data) {
                    @Suppress("UNCHECKED_CAST")
                    val nodeMap = value as? Map<String, Any> ?: continue
                    val nodeObj = org.json.JSONObject()
                    for ((k, v) in nodeMap) {
                        when (v) {
                            is Boolean -> nodeObj.put(k, v)
                            is Int     -> nodeObj.put(k, v)
                            is Double  -> nodeObj.put(k, v)
                            is Float   -> nodeObj.put(k, v.toDouble())
                            is Long    -> nodeObj.put(k, v)
                            else       -> nodeObj.put(k, v.toString())
                        }
                    }
                    existingObj.put(key, nodeObj)
                }

                prefs.edit().putString("widget_remote_data_$widgetId", existingObj.toString()).commit()

                // Trigger immediate re-render
                scope.launch {
                    val index  = SlotRegistry.getSlotIndex(context, widgetId) ?: return@launch
                    val widget = SlotRegistry.getWidget(index) ?: return@launch
                    widget.updateAll(context)
                }

                "success"
            } catch (e: Exception) {
                throw Exception("E_WIDGET_ERROR [$widgetId]: ${e.message}")
            }
        }

        AsyncFunction("removeWidgetSchema") { widgetId: String ->
            val context = appContext.reactContext ?: throw Exception("React context not available")

            try {
                val index = SlotRegistry.getSlotIndex(context, widgetId)
                if (index != null) SlotRegistry.disableSlot(context, index)

                val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)
                prefs.edit()
                    .remove("widget_schema_$widgetId")
                    .remove("widget_remote_data_$widgetId")
                    .apply()

                WorkManager.getInstance(context).cancelUniqueWork("widget_refresh_$widgetId")
                SlotRegistry.releaseSlot(context, widgetId)

                "success"
            } catch (e: Exception) {
                throw Exception("E_WIDGET_ERROR [$widgetId]: ${e.message}")
            }
        }

        AsyncFunction("getSlotInfo") {
            val context = appContext.reactContext ?: throw Exception("React context not available")
            val assigned = SlotRegistry.getAllAssigned(context)
            mapOf(
                "maxSlots"       to SlotRegistry.MAX_SLOTS,
                "usedSlots"      to assigned.size,
                "availableSlots" to (SlotRegistry.MAX_SLOTS - assigned.size),
                "assignments"    to assigned
            )
        }

        AsyncFunction("seedSharedAsset") { localPath: String, filename: String, force: Boolean ->
            val context = appContext.reactContext ?: throw Exception("React context not available")

            try {
                val dest = java.io.File(context.filesDir, filename)

                if (dest.exists() && !force) return@AsyncFunction "exists"
                if (dest.exists()) dest.delete()

                val src = java.io.File(localPath)
                src.inputStream().use { input ->
                    dest.outputStream().use { output -> input.copyTo(output) }
                }

                "copied"
            } catch (e: Exception) {
                throw Exception("E_SEED_ASSET [$filename]: ${e.message}")
            }
        }

        OnDestroy {
            scope.cancel()
        }
    }

    private fun updateWidgetPreview(
        context: Context,
        widgetId: String,
        json: String,
        receiverClass: Class<*>
    ) {
        if (android.os.Build.VERSION.SDK_INT < 36) return

        try {
            val schema   = org.json.JSONObject(json)
            val small    = schema.optJSONObject("small") ?: return
            val children = small.optJSONArray("children") ?: return
            val bgColor  = parseColor(small.optString("backgroundColor", "#1C1C1E"))

            val views = RemoteViews(context.packageName, R.layout.widget_preview_root)
            views.setInt(R.id.preview_root, "setBackgroundColor", bgColor)

            val textLines = mutableListOf<String>()
            extractTextLines(children, textLines)

            views.setTextViewText(R.id.preview_line1, textLines.getOrElse(0) { "" })
            views.setTextViewText(R.id.preview_line2, textLines.getOrElse(1) { "" })
            views.setTextViewText(R.id.preview_line3, textLines.getOrElse(2) { "" })

            val manager  = AppWidgetManager.getInstance(context)
            val provider = ComponentName(context, receiverClass)
            manager.setWidgetPreview(provider, AppWidgetProviderInfo.WIDGET_CATEGORY_HOME_SCREEN, views)

        } catch (e: Exception) {
            android.util.Log.w("WIDGET_BRIDGE", "Preview update failed: ${e.message}")
        }
    }

    private fun extractTextLines(children: org.json.JSONArray, into: MutableList<String>) {
        for (i in 0 until children.length()) {
            if (into.size >= 3) return
            val node = children.getJSONObject(i)
            when (node.optString("type")) {
                "text"      -> { val v = node.optString("value", ""); if (v.isNotEmpty()) into.add(v) }
                "container" -> node.optJSONArray("children")?.let { extractTextLines(it, into) }
            }
        }
    }

    private fun parseColor(hex: String): Int {
        if (hex.equals("transparent", ignoreCase = true)) return android.graphics.Color.TRANSPARENT
        return try { android.graphics.Color.parseColor(hex) } catch (e: Exception) { android.graphics.Color.DKGRAY }
    }
}