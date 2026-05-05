package expo.modules.widgetbuilder

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProviderInfo
import android.content.ComponentName
import android.content.Context
import android.widget.RemoteViews
import androidx.glance.appwidget.updateAll
import androidx.work.Data
import androidx.work.ExistingPeriodicWorkPolicy
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

        OnDestroy {
            scope.cancel()
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

            // Build a RemoteViews preview from the JSON text nodes
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