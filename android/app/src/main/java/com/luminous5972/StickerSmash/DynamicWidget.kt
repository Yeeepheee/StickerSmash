package com.luminous5972.StickerSmash


import android.content.Context
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
import org.json.JSONObject
import org.json.JSONArray

class DynamicWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)
        val jsonString = prefs.getString("widget_schema", "{}") ?: "{}"

        provideContent {
            val schema = JSONObject(jsonString)
            val bgColor = schema.optString("backgroundColor", "#ffffff")
            val layoutType = schema.optString("layout", "vstack")
            val children = schema.optJSONArray("children")

            val rootModifier = GlanceModifier
                .fillMaxSize()
                .background(ColorProvider(Color(android.graphics.Color.parseColor(bgColor))))
                .padding(8.dp)

            // DYNAMIC LAYOUT SWITCHING with Inlined Loops
            if (layoutType == "hstack") {
                Row(modifier = rootModifier, verticalAlignment = Alignment.CenterVertically) {
                    children?.let {
                        for (i in 0 until it.length()) {
                            val node = it.getJSONObject(i)
                            if (node.optString("type") == "spacer") {
                                Spacer(modifier = GlanceModifier.defaultWeight()) // ✅ Works perfectly here!
                            } else {
                                RenderNode(node)
                            }
                        }
                    }
                }
            } else {
                Column(modifier = rootModifier, horizontalAlignment = Alignment.CenterHorizontally) {
                    children?.let {
                        for (i in 0 until it.length()) {
                            val node = it.getJSONObject(i)
                            if (node.optString("type") == "spacer") {
                                Spacer(modifier = GlanceModifier.defaultWeight()) // ✅ Works perfectly here!
                            } else {
                                RenderNode(node)
                            }
                        }
                    }
                }
            }
        }
    }

    @Composable
    private fun RenderNode(node: JSONObject) {
        if (node.optString("type") == "text") {
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
    }
}