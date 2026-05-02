package expo.modules.widgetbuilder

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import android.net.Uri
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.DpSize
import androidx.glance.*
import androidx.glance.action.clickable
import androidx.glance.appwidget.*
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.layout.*
import androidx.glance.text.*
import androidx.glance.unit.ColorProvider
import coil.imageLoader
import coil.request.CachePolicy
import coil.request.ImageRequest
import coil.request.SuccessResult
import kotlinx.coroutines.*
import org.json.JSONArray
import org.json.JSONObject

class DynamicWidget : GlanceAppWidget() {

    companion object {
        private val SMALL_SIZE = DpSize(100.dp, 100.dp)
        private val MEDIUM_SIZE = DpSize(250.dp, 100.dp)
        private val LARGE_SIZE = DpSize(250.dp, 250.dp)
    }

    override val sizeMode: SizeMode = SizeMode.Responsive(
        setOf(SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE)
    )

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        android.util.Log.d("WIDGET_TEST", "provideGlance started")
        val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)
        
        val jsonString = prefs.getString("widget_schema", "{}") ?: "{}"
        val remoteDataString = prefs.getString("widget_remote_data", "{}") ?: "{}"
        
        provideContent {
            val composeContext = LocalContext.current
            val currentSize = LocalSize.current

            val schemaRoot = remember(jsonString) { JSONObject(jsonString) }
            val remoteData = remember(remoteDataString) { JSONObject(remoteDataString) }
            
            val sizeKey = when (currentSize) {
                LARGE_SIZE -> "large"
                MEDIUM_SIZE -> "medium"
                else -> "small"
            }

            val currentLayoutSchema = schemaRoot.optJSONObject(sizeKey)
                ?: schemaRoot.optJSONObject("small")
                ?: JSONObject()

            var bitmaps by remember { mutableStateOf<Map<String, Bitmap>>(emptyMap()) }
            
            val imageUrls = remember(sizeKey, remoteData) {
                val urls = mutableSetOf<String>()
                extractImageUrls(currentLayoutSchema.optJSONArray("children"), remoteData, urls)
                urls
            }

            LaunchedEffect(imageUrls) {
                withTimeoutOrNull(5000) {
                    coroutineScope {
                        val downloaded = imageUrls.map { url ->
                            async(Dispatchers.IO) { 
                                url to downloadBitmap(composeContext, url) 
                            }
                        }.awaitAll().filter { it.second != null }.toMap()
                        
                        @Suppress("UNCHECKED_CAST")
                        bitmaps = downloaded as Map<String, Bitmap>
                    }
                }
            }

            RenderLayout(currentLayoutSchema, bitmaps, remoteData, isRoot = true)
        }
    }

    @Composable
    private fun RenderLayout(config: JSONObject, bitmaps: Map<String, Bitmap>, remoteData: JSONObject, isRoot: Boolean = false, modifier: GlanceModifier = GlanceModifier) {
        val id = config.optString("id")
        val override = if (id.isNotEmpty()) remoteData.optJSONObject(id) else null
        
        val baseBg = config.optString("backgroundColor", "transparent")
        val bgColorString = if (override?.has("backgroundColor") == true) override.optString("backgroundColor") else baseBg
        
        val layoutType = config.optString("layout", "vstack")
        val children = config.optJSONArray("children") ?: JSONArray()

        var backgroundNode: JSONObject? = null
        val foregroundChildren = JSONArray()
        for (i in 0 until children.length()) {
            val child = children.getJSONObject(i)
            if (isRoot && child.optBoolean("isBackground", false)) {
                backgroundNode = child
            } else {
                foregroundChildren.put(child)
            }
        }

        val baseModifier = modifier
            .background(ColorProvider(safeParseColor(bgColorString)))
            .let { if (isRoot) it.appWidgetBackground().cornerRadius(16.dp).fillMaxSize() else it }

        if (isRoot) {
            Box(modifier = baseModifier) {
                if (backgroundNode != null) {
                    RenderImage(backgroundNode, bitmaps, remoteData, GlanceModifier.fillMaxSize())
                }
                val contentModifier = GlanceModifier.fillMaxSize().padding(16.dp)
                RenderForegroundLayout(layoutType, foregroundChildren, bitmaps, remoteData, contentModifier)
            }
        } else {
            RenderForegroundLayout(layoutType, foregroundChildren, bitmaps, remoteData, baseModifier)
        }
    }

    @Composable
    private fun RenderForegroundLayout(layoutType: String, children: JSONArray, bitmaps: Map<String, Bitmap>, remoteData: JSONObject, modifier: GlanceModifier) {
        when (layoutType) {
            "hstack" -> Row(modifier = modifier, verticalAlignment = Alignment.CenterVertically) {
                RenderChildrenRow(children, bitmaps, remoteData)
            }
            "zstack" -> Box(modifier = modifier, contentAlignment = Alignment.Center) {
                RenderChildrenBox(children, bitmaps, remoteData)
            }
            else -> Column(modifier = modifier, horizontalAlignment = Alignment.Start) {
                RenderChildrenColumn(children, bitmaps, remoteData)
            }
        }
    }

    @Composable
    private fun RenderChildrenBox(children: JSONArray, bitmaps: Map<String, Bitmap>, remoteData: JSONObject) {
        for (i in 0 until children.length()) {
            RenderNodeBox(children.getJSONObject(i), bitmaps, remoteData)
        }
    }

    @Composable
    private fun RenderNodeBox(node: JSONObject, bitmaps: Map<String, Bitmap>, remoteData: JSONObject) {
        val alignment = parseAlignment(node.optString("alignment", "center"))
        val baseModifier = ModifierWithLink(node, remoteData, GlanceModifier.fillMaxSize())
        Box(modifier = baseModifier, contentAlignment = alignment) {
            when (node.optString("type")) {
                "text" -> RenderText(node, remoteData, GlanceModifier)
                "image" -> RenderImage(node, bitmaps, remoteData, GlanceModifier)
                "container" -> RenderLayout(node, bitmaps, remoteData, isRoot = false, modifier = GlanceModifier) 
            }
        }
    }

    @Composable
    private fun ColumnScope.RenderChildrenColumn(children: JSONArray, bitmaps: Map<String, Bitmap>, remoteData: JSONObject) {
        for (i in 0 until children.length()) {
            RenderNodeColumn(children.getJSONObject(i), bitmaps, remoteData)
        }
    }

    @Composable
    private fun ColumnScope.RenderNodeColumn(node: JSONObject, bitmaps: Map<String, Bitmap>, remoteData: JSONObject) {
        val modifier = ModifierWithLink(node, remoteData, GlanceModifier)
        when (node.optString("type")) {
            "text" -> RenderText(node, remoteData, modifier)
            "image" -> RenderImage(node, bitmaps, remoteData, modifier)
            "spacer" -> Spacer(modifier = GlanceModifier.defaultWeight())
            "container" -> RenderLayout(node, bitmaps, remoteData, isRoot = false, modifier = GlanceModifier.fillMaxWidth())
        }
    }

    @Composable
    private fun RowScope.RenderChildrenRow(children: JSONArray, bitmaps: Map<String, Bitmap>, remoteData: JSONObject) {
        for (i in 0 until children.length()) {
            RenderNodeRow(children.getJSONObject(i), bitmaps, remoteData)
        }
    }

    @Composable
    private fun RowScope.RenderNodeRow(node: JSONObject, bitmaps: Map<String, Bitmap>, remoteData: JSONObject) {
        val modifier = ModifierWithLink(node, remoteData, GlanceModifier)
        when (node.optString("type")) {
            "text" -> RenderText(node, remoteData, modifier)
            "image" -> RenderImage(node, bitmaps, remoteData, modifier)
            "spacer" -> Spacer(modifier = GlanceModifier.defaultWeight())
            "container" -> RenderLayout(node, bitmaps, remoteData, isRoot = false, modifier = modifier)
        }
    }

    @Composable
    private fun RenderText(node: JSONObject, remoteData: JSONObject, modifier: GlanceModifier = GlanceModifier) {
        val id = node.optString("id")
        val override = if (id.isNotEmpty()) remoteData.optJSONObject(id) else null
        
        val value = if (override?.has("value") == true) override.optString("value") else node.optString("value", "")
        val colorString = if (override?.has("color") == true) override.optString("color") else node.optString("color", "#000000")
        
        val fontSize = node.optDouble("fontSize", 16.0).sp
        val textStyle = TextStyle(
            fontSize = fontSize,
            color = ColorProvider(safeParseColor(colorString, android.graphics.Color.BLACK)),
            textAlign = when (node.optString("textAlignment")) {
                "center" -> TextAlign.Center
                "trailing" -> TextAlign.End
                else -> TextAlign.Start
            }
        )

        Text(text = value, style = textStyle, modifier = modifier)
    }

    @Composable
    private fun RenderImage(node: JSONObject, bitmaps: Map<String, Bitmap>, remoteData: JSONObject, modifier: GlanceModifier = GlanceModifier) {
        val id = node.optString("id")
        val override = if (id.isNotEmpty()) remoteData.optJSONObject(id) else null
        
        val src = if (override?.has("src") == true) override.optString("src") else node.optString("src", "")
        val bmp = bitmaps[src]
        
        val isBackground = node.optBoolean("isBackground", false)
        val finalModifier = if (isBackground) {
            modifier.fillMaxSize()
        } else {
            val width = node.optInt("width", 50).dp
            val height = node.optInt("height", 50).dp
            modifier.size(width, height)
        }
        
        val contentMode = if (node.optString("contentMode") == "fill") ContentScale.Crop else ContentScale.Fit

        if (bmp != null) {
            Image(provider = ImageProvider(bmp), contentDescription = "Dynamic Image", contentScale = contentMode, modifier = finalModifier)
        } else {
            val placeholderColor = if (isBackground) Color.DarkGray else Color.LightGray
            Spacer(modifier = finalModifier.background(placeholderColor))
        }
    }

    private fun extractImageUrls(children: JSONArray?, remoteData: JSONObject, urls: MutableSet<String>) {
        children?.let {
            for (i in 0 until it.length()) {
                val node = it.getJSONObject(i)
                val id = node.optString("id")
                val override = if (id.isNotEmpty()) remoteData.optJSONObject(id) else null

                when (node.optString("type")) {
                    "image" -> {
                        val src = if (override?.has("src") == true) override.optString("src") else node.optString("src")
                        if (!src.isNullOrEmpty()) urls.add(src)
                    }
                    "container" -> extractImageUrls(node.optJSONArray("children"), remoteData, urls)
                }
            }
        }
    }

    private fun ModifierWithLink(node: JSONObject, remoteData: JSONObject, modifier: GlanceModifier): GlanceModifier {
        val id = node.optString("id")
        val override = if (id.isNotEmpty()) remoteData.optJSONObject(id) else null
        val link = if (override?.has("link") == true) override.optString("link") else node.optString("link", "")
        
        return if (link.isNotEmpty()) {
            modifier.clickable(
                actionStartActivity(
                    Intent(Intent.ACTION_VIEW, Uri.parse(link)).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                )
            )
        } else {
            modifier
        }
    }

    private fun safeParseColor(colorString: String, default: Int = android.graphics.Color.WHITE): Color {
        if (colorString.equals("transparent", ignoreCase = true)) return Color.Transparent
        return try { Color(android.graphics.Color.parseColor(colorString)) } catch (e: Exception) { Color(default) }
    }
    
    private suspend fun downloadBitmap(context: Context, urlString: String): Bitmap? = withContext(Dispatchers.IO) {
        try {
            if (urlString.isEmpty()) return@withContext null

            var dataToLoad: Any = urlString
            if (urlString.startsWith("shared://")) {
                val filename = urlString.removePrefix("shared://")
                val file = java.io.File(context.filesDir, filename)
                if (file.exists()) dataToLoad = file else return@withContext null
            } else if (urlString.startsWith("file://")) {
                val path = urlString.removePrefix("file://")
                val file = java.io.File(path)
                if (file.exists()) dataToLoad = file
            }

            val request = ImageRequest.Builder(context)
                .data(dataToLoad)
                .addHeader("User-Agent", "DynamicWidgetApp/1.0 (Android)") 
                .size(600)
                .allowHardware(false) 
                .memoryCachePolicy(CachePolicy.DISABLED) 
                .diskCachePolicy(CachePolicy.DISABLED)   
                .build()

            val result = context.imageLoader.execute(request)
            if (result is SuccessResult) (result.drawable as? BitmapDrawable)?.bitmap else null
        } catch (e: Exception) {
            null
        }
    }

    private fun parseAlignment(align: String): Alignment {
        return when (align) {
            "topLeading", "topLeft" -> Alignment.TopStart
            "topCenter" -> Alignment.TopCenter
            "topTrailing", "topRight" -> Alignment.TopEnd
            "centerLeading", "centerLeft" -> Alignment.CenterStart
            "center" -> Alignment.Center
            "centerTrailing", "centerRight" -> Alignment.CenterEnd
            "bottomLeading", "bottomLeft" -> Alignment.BottomStart
            "bottomCenter" -> Alignment.BottomCenter
            "bottomTrailing", "bottomRight" -> Alignment.BottomEnd
            else -> Alignment.Center
        }
    }
}