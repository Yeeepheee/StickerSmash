package expo.modules.widgetbuilder
import android.content.Context
import androidx.glance.appwidget.updateAll
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

class WidgetBridge : Module() {
    override fun definition() = ModuleDefinition {
        Name("WidgetBridge")

        AsyncFunction("saveWidgetSchema") { json: String ->
            val context = appContext.reactContext ?: throw Exception("React context not available")
            
            try {
                val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)
                prefs.edit().putString("widget_schema", json).commit()

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