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
            val jsonString = prefs.getString("widget_schema", "{}") ?: "{}"
            val schemaRoot = JSONObject(jsonString)
            val remoteUrl = schemaRoot.optString("remoteConfigUrl", "")

            if (remoteUrl.isNotEmpty()) {

                val responseText = java.net.URL(remoteUrl).readText()
                
                prefs.edit().putString("widget_remote_data", responseText).commit()
                
                DynamicWidget().updateAll(applicationContext)
            }
            Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            Result.retry()
        }
    }
}