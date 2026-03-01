package expo.modules.widgetbuilder
import android.content.Context
import androidx.glance.appwidget.updateAll
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

class WidgetBridge : Module() {
    override fun definition() = ModuleDefinition {
        // Name of the module exposed to JavaScript
        Name("WidgetBridge")

        // Defines an async function matching your old saveWidgetSchema
        AsyncFunction("saveWidgetSchema") { json: String ->
            // In Expo, context is accessed via appContext
            val context = appContext.reactContext ?: throw Exception("React context not available")
            
            try {
                val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)
                prefs.edit().putString("widget_schema", json).apply()

                MainScope().launch {
                    DynamicWidget().updateAll(context)
                }
                
                // Return value is automatically resolved to the JS side
                "success" 
            } catch (e: Exception) {
                // Thrown exceptions are automatically rejected to JS
                throw Exception("E_WIDGET_ERROR: ${e.message}")
            }
        }
    }
}