package expo.modules.widgetbuilder

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.layout.*
import androidx.glance.text.*
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.provideContent
import androidx.glance.unit.ColorProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class DynamicWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)
        val jsonString = prefs.getString("widget_schema", "{}") ?: "{}"
        val schema = JSONObject(jsonString)
        val children = schema.optJSONArray("children")

        // 1. Pre-fetch images natively to avoid heavy dependencies like Coil/Glide
        val bitmaps = mutableMapOf<String, Bitmap>()
        children?.let {
            for (i in 0 until it.length()) {
                val node = it.getJSONObject(i)
                if (node.optString("type") == "image") {
                    val src = node.optString("src")
                    if (src.isNotEmpty() && !bitmaps.containsKey(src)) {
                        downloadBitmap(src)?.let { bmp -> bitmaps[src] = bmp }
                    }
                }
            }
        }

        provideContent {
            val bgColor = schema.optString("backgroundColor", "#ffffff")
            val layoutType = schema.optString("layout", "vstack")

            val rootModifier = GlanceModifier
                .fillMaxSize()
                .background(ColorProvider(Color(android.graphics.Color.parseColor(bgColor))))
                .padding(8.dp)

            // 2. Cleaned up layout switching
            if (layoutType == "hstack") {
                Row(modifier = rootModifier, verticalAlignment = Alignment.CenterVertically) {
                    RenderChildren(children, bitmaps)
                }
            } else {
                Column(modifier = rootModifier, horizontalAlignment = Alignment.CenterHorizontally) {
                    RenderChildren(children, bitmaps)
                }
            }
        }
    }

    @Composable
    private fun RenderChildren(children: JSONArray?, bitmaps: Map<String, Bitmap>) {
        children?.let {
            for (i in 0 until it.length()) {
                val node = it.getJSONObject(i)
                if (node.optString("type") == "spacer") {
                    Spacer(modifier = GlanceModifier)
                } else {
                    RenderNode(node, bitmaps)
                }
            }
        }
    }



    @Composable
    private fun RenderNode(node: JSONObject, bitmaps: Map<String, Bitmap>) {
        when (node.optString("type")) {
            "text" -> {
                Text(
                    text = node.optString("value", ""),
                    style = TextStyle(
                        fontSize = node.optDouble("fontSize", 16.0).sp,
                        color = ColorProvider(Color(android.graphics.Color.parseColor(node.optString("color", "#000000")))),
                        textAlign = when (node.optString("alignment")) {
                            "center" -> TextAlign.Center
                            "trailing" -> TextAlign.End
                            else -> TextAlign.Start
                        }
                    ),
                    modifier = GlanceModifier.fillMaxWidth()
                )
            }
            "image" -> {
                val src = node.optString("src")
                val bmp = bitmaps[src]
                val width = node.optInt("width", 50).dp
                val height = node.optInt("height", 50).dp
                val contentMode = if (node.optString("contentmode") == "fill") ContentScale.Crop else ContentScale.Fit

                if (bmp != null) {
                    Image(
                        provider = ImageProvider(bmp),
                        contentDescription = "Dynamic Image",
                        contentScale = contentMode,
                        modifier = GlanceModifier.size(width, height)
                    )
                } else {
                    // Fallback placeholder if the image fails to load
                    Spacer(modifier = GlanceModifier.size(width, height).background(Color.LightGray))
                }
            }
        }
    }

    // Standard HTTP connection to drop dependencies
    private suspend fun downloadBitmap(urlString: String): Bitmap? {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL(urlString)
                val connection = url.openConnection() as HttpURLConnection
                connection.doInput = true
                connection.connect()
                BitmapFactory.decodeStream(connection.inputStream)
            } catch (e: Exception) {
                null
            }
        }
    }
}