package expo.modules.widgetbuilder

import android.content.Context
import androidx.glance.appwidget.updateAll
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

class WidgetUpdateWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val prefs = applicationContext.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)

            
            val targetWidgetIds = inputData.getString("widgetId")
                ?.let { listOf(it) }
                ?: SlotRegistry.getAllAssigned(applicationContext).keys.toList()

            for (widgetId in targetWidgetIds) {
                val jsonString = prefs.getString("widget_schema_$widgetId", "{}") ?: "{}"
                val remoteUrl  = JSONObject(jsonString).optString("remoteConfigUrl", "")

                if (remoteUrl.isNotEmpty()) {
                    try {
                        val connection = java.net.URL(remoteUrl).openConnection() as java.net.HttpURLConnection
                        connection.connectTimeout = 5_000
                        connection.readTimeout = 5_000
                        val responseText = connection.inputStream.bufferedReader().readText()
                        prefs.edit().putString("widget_remote_data_$widgetId", responseText).commit()
                        android.util.Log.d("WIDGET_WORKER", "Remote data updated for $widgetId")
                    } catch (e: Exception) {
                        android.util.Log.w("WIDGET_WORKER", "Remote fetch failed for $widgetId: ${e.message}")
                    }
                }

                
                val index  = SlotRegistry.getSlotIndex(applicationContext, widgetId) ?: continue
                val widget = SlotRegistry.getWidget(index) ?: continue
                widget.updateAll(applicationContext)
            }

            Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            Result.retry()
        }
    }
}