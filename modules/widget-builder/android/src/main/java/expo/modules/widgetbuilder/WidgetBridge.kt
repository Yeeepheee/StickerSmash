package expo.modules.widgetbuilder

import android.content.Context
import androidx.glance.appwidget.updateAll
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

class WidgetBridge : Module() {
    override fun definition() = ModuleDefinition {
        Name("WidgetBridge")

        AsyncFunction("saveWidgetSchema") { json: String ->
            val context = appContext.reactContext ?: throw Exception("React context not available")
            
            try {
                val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)
                prefs.edit().putString("widget_schema", json).commit()

                // Schedule periodic refresh
                val periodicWork = PeriodicWorkRequestBuilder<WidgetUpdateWorker>(
                    15, TimeUnit.MINUTES
                ).build()

                WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                    "widget_refresh",
                    ExistingPeriodicWorkPolicy.KEEP,
                    periodicWork
                )

                MainScope().launch {
                    DynamicWidget().updateAll(context)
                }
                
                "success" 
            } catch (e: Exception) {
                throw Exception("E_WIDGET_ERROR: ${e.message}")
            }
        }
    }
}