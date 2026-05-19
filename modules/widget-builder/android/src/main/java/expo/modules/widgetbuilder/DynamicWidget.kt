package expo.modules.widgetbuilder

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
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

open class DynamicWidget(val widgetId: String) : GlanceAppWidget() {

    companion object {
        val SMALL_SIZE  = DpSize(100.dp, 100.dp)
        val MEDIUM_SIZE = DpSize(250.dp, 100.dp)
        val LARGE_SIZE  = DpSize(250.dp, 250.dp)

        val ALL_SLOT_IDS = listOf("slot0", "slot1", "slot2", "slot3", "slot4")

        @Composable
        fun PreviewContent(jsonString: String, remoteDataString: String = "{}") {
            val schemaRoot = remember(jsonString) { JSONObject(jsonString) }
            val remoteData = remember(remoteDataString) { JSONObject(remoteDataString) }
            val schema     = schemaRoot.optJSONObject("small") ?: JSONObject()
            val instance   = remember { DynamicWidget("preview") }
            instance.RenderLayout(schema, emptyMap(), remoteData, isRoot = true)
        }
    }

    override val sizeMode: SizeMode = SizeMode.Responsive(
        setOf(SMALL_SIZE, MEDIUM_SIZE, LARGE_SIZE)
    )

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        android.util.Log.d("WIDGET_TEST", "provideGlance started for $widgetId")
        val prefs = context.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)

        val jsonString = prefs.getString("widget_schema_$widgetId", "{}") ?: "{}"
        val schemaRoot = JSONObject(jsonString)

        val cachedRemoteData = prefs.getString("widget_remote_data_$widgetId", "{}") ?: "{}"
        val remoteConfigUrl  = schemaRoot.optString("remoteConfigUrl").takeIf { it.isNotEmpty() }

        val remoteDataString: String = if (remoteConfigUrl != null) {
            val fresh = withTimeoutOrNull(5_000) { fetchRemoteJson(remoteConfigUrl) }
            if (fresh != null) {
                prefs.edit().putString("widget_remote_data_$widgetId", fresh).apply()
                android.util.Log.d("WIDGET_TEST", "[$widgetId] Remote config refreshed")
                fresh
            } else {
                android.util.Log.w("WIDGET_TEST", "[$widgetId] Remote config fetch failed, using cache")
                cachedRemoteData
            }
        } else {
            cachedRemoteData
        }

        val remoteData = JSONObject(remoteDataString)

        val imageUrls = mutableSetOf<String>()
        for (sizeKey in listOf("small", "medium", "large")) {
            val schema = schemaRoot.optJSONObject(sizeKey) ?: continue
            extractImageUrls(schema.optJSONArray("children"), remoteData, imageUrls)
        }

        val bitmaps = mutableMapOf<String, Bitmap>()
        withTimeoutOrNull(5_000) {
            coroutineScope {
                imageUrls.map { url ->
                    async(Dispatchers.IO) {
                        val bmp = downloadBitmap(context, url)
                        if (bmp != null) synchronized(bitmaps) { bitmaps[url] = bmp }
                    }
                }.awaitAll()
            }
        }

        provideContent {
            val currentSize = LocalSize.current

            val sizeKey = when (currentSize) {
                LARGE_SIZE  -> "large"
                MEDIUM_SIZE -> "medium"
                else        -> "small"
            }

            val currentLayoutSchema = schemaRoot.optJSONObject(sizeKey)
                ?: schemaRoot.optJSONObject("small")
                ?: JSONObject()

            RenderLayout(currentLayoutSchema, bitmaps, remoteData, isRoot = true)
        }
    }

    // MARK: Remote fetch helper

    private suspend fun fetchRemoteJson(url: String): String? = withContext(Dispatchers.IO) {
        try {
            val connection = (java.net.URL(url).openConnection() as java.net.HttpURLConnection).apply {
                setRequestProperty("Cache-Control", "no-cache")
                connectTimeout = 5_000
                readTimeout    = 5_000
            }
            val body = connection.inputStream.bufferedReader().readText()
            connection.disconnect()
            JSONObject(body)
            body
        } catch (e: Exception) {
            android.util.Log.w("WIDGET_TEST", "fetchRemoteJson($url) failed: ${e.message}")
            null
        }
    }

    // MARK: Helpers

    private fun overrideFor(node: JSONObject, remoteData: JSONObject): JSONObject? {
        val id = node.optString("id")
        return if (id.isNotEmpty()) remoteData.optJSONObject(id) else null
    }

    private fun isHidden(node: JSONObject, remoteData: JSONObject): Boolean {
        val id = node.optString("id")
        if (id.isNotEmpty() && remoteData.has(id)) {
            val override = remoteData.optJSONObject(id)
            if (override?.has("hidden") == true) {
                return override.getBoolean("hidden")
            }
        }
        return node.optBoolean("hidden", false)
    }

    // MARK: Layout

    @Composable
    private fun RenderLayout(
        node: JSONObject,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject,
        isRoot: Boolean = false,
        modifier: GlanceModifier = GlanceModifier
    ) {
        val layout   = node.optString("layout", "vstack")
        val children = node.optJSONArray("children") ?: JSONArray()
        val override = overrideFor(node, remoteData)
        val bg = safeParseColor(
            override?.optString("backgroundColor")?.takeIf { override.has("backgroundColor") }
                ?: node.optString("backgroundColor", "transparent")
        )

        val explicitWidth  = node.optInt("width",  -1)
        val explicitHeight = node.optInt("height", -1)
        val padAll    = node.optInt("padding",       0)
        val padTop    = node.optInt("paddingTop",    padAll)
        val padBottom = node.optInt("paddingBottom", padAll)
        val padStart  = node.optInt("paddingLeft",   node.optInt("paddingStart", padAll))
        val padEnd    = node.optInt("paddingRight",  node.optInt("paddingEnd",   padAll))

        val finalMod = modifier.background(bg)
            .run { if (isRoot) fillMaxSize() else this }
            .run { if (!isRoot && explicitWidth  > 0) width(explicitWidth.dp)   else this }
            .run { if (!isRoot && explicitHeight > 0) height(explicitHeight.dp) else this }
            .run {
                val hasPad = padTop > 0 || padBottom > 0 || padStart > 0 || padEnd > 0
                when {
                    hasPad -> padding(start = padStart.dp, top = padTop.dp,
                                      end   = padEnd.dp,   bottom = padBottom.dp)
                    isRoot && layout != "zstack" -> padding(16.dp)
                    else -> this
                }
            }
            .run {
                val r = node.optInt("cornerRadius", 0)
                if (r > 0) cornerRadius(r.dp) else this
            }

        val spacing = node.optInt("spacing", 0)

        when (layout) {
            "hstack" -> {
                val parentHasHeight = isRoot || explicitHeight > 0

                Row(modifier = finalMod, verticalAlignment = Alignment.CenterVertically) {
                    for (i in 0 until children.length()) {
                        if (spacing > 0 && i > 0) Spacer(modifier = GlanceModifier.width(spacing.dp))
                        RenderNodeRow(children.getJSONObject(i), bitmaps, remoteData, parentHasHeight)
                    }
                }
            }

            "zstack" -> Box(modifier = when {
                isRoot -> modifier.background(bg).fillMaxSize()
                explicitWidth > 0 || explicitHeight > 0 -> finalMod
                else -> modifier.background(bg).fillMaxWidth()
            }) {
                val childInset = if (isRoot) 10 else 0
                for (i in 0 until children.length()) {
                    val child    = children.getJSONObject(i)
                    if (isHidden(child, remoteData)) continue
                    val isBg     = child.optBoolean("isBackground", false)
                    val alignStr = child.optString("alignment", "center")
                    val wrapMod  = when {
                        isRoot && !isBg && childInset > 0 ->
                            GlanceModifier.fillMaxSize().padding(childInset.dp)
                        isRoot ->
                            GlanceModifier.fillMaxSize()
                        else ->
                            GlanceModifier.fillMaxWidth()
                            .run { if (explicitHeight > 0) fillMaxHeight() else this}
                    }
                    Box(modifier = wrapMod, contentAlignment = parseAlignment(alignStr)) {
                        RenderLeafOrContainer(child.optString("type"), child, bitmaps, remoteData, GlanceModifier)
                    }
                }
            }

            else -> Column(modifier = finalMod) {
                val centerContent = node.optString("contentAlignment", "") == "center"
                if (centerContent) Spacer(modifier = GlanceModifier.defaultWeight())

                val hasSpacer = (0 until children.length()).any { i ->
                    children.getJSONObject(i).optString("type") == "spacer" &&
                    !isHidden(children.getJSONObject(i), remoteData)
                }

                for (i in 0 until children.length()) {
                    if (spacing > 0 && i > 0) Spacer(modifier = GlanceModifier.height(spacing.dp))
                    RenderNodeColumn(children.getJSONObject(i), bitmaps, remoteData, allowFlex = !hasSpacer)
                }
                if (centerContent) Spacer(modifier = GlanceModifier.defaultWeight())
            }
        }
    }

    @Composable
    private fun RenderForegroundLayout(
        layoutType: String,
        children: JSONArray,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject,
        modifier: GlanceModifier
    ) {
        when (layoutType) {
            "hstack" -> Row(modifier = modifier, verticalAlignment = Alignment.CenterVertically) {
                RenderChildrenRow(children, bitmaps, remoteData, parentHasHeight = false)
            }
            "zstack" -> Box(modifier = modifier, contentAlignment = Alignment.Center) {
                RenderChildrenBox(children, bitmaps, remoteData)
            }
            else -> Column(modifier = modifier, horizontalAlignment = Alignment.Start) {
                RenderChildrenColumn(children, bitmaps, remoteData)
            }
        }
    }

    // MARK: Column children

    @Composable
    private fun ColumnScope.RenderChildrenColumn(
        children: JSONArray,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject,
        allowFlex: Boolean = true
    ) {
        for (i in 0 until children.length())
            RenderNodeColumn(children.getJSONObject(i), bitmaps, remoteData, allowFlex)
    }

    @Composable
    private fun ColumnScope.RenderNodeColumn(
        node: JSONObject,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject,
        allowFlex: Boolean = true   
    ) {
        if (isHidden(node, remoteData)) return
        val type = node.optString("type")

        if (type == "spacer") {
            var mod: GlanceModifier = GlanceModifier
            val height = node.optInt("height", -1)
            if (height > 0) mod = mod.height(height.dp) else mod = mod.defaultWeight()
            val width = node.optInt("width", -1)
            if (width > 0) mod = mod.width(width.dp)
            Spacer(modifier = mod)
            return
        }

        val override  = overrideFor(node, remoteData)
        val linkMod   = ModifierWithLink(node, remoteData, GlanceModifier)
        val alignStr  = override?.optString("alignment")?.takeIf { override.has("alignment") }
                        ?: node.optString("alignment", "")
        val alignment = if (alignStr.isNotEmpty()) parseAlignment(alignStr) else null

        val isText            = type == "text"
        val isContainer       = type == "container"
        val hasExplicitHeight = node.has("height") || (override?.has("height") == true)

        val shouldFlex = false

        if (alignment != null) {
            val boxMod = if (shouldFlex) GlanceModifier.defaultWeight().fillMaxWidth()
                         else           GlanceModifier.fillMaxWidth()
            Box(modifier = boxMod, contentAlignment = alignment) {
                val innerMod = if (isContainer) {
                    if (shouldFlex) linkMod.fillMaxWidth().fillMaxHeight()
                    else            linkMod.fillMaxWidth()
                } else linkMod
                RenderLeafOrContainer(type, node, bitmaps, remoteData, innerMod)
            }
        } else {
            val baseMod = if (isContainer || isText) linkMod.fillMaxWidth() else linkMod
            val itemMod = if (shouldFlex) baseMod.defaultWeight() else baseMod
            RenderLeafOrContainer(type, node, bitmaps, remoteData, itemMod)
        }
    }

    // MARK: Row children

    @Composable
    private fun RowScope.RenderChildrenRow(
        children: JSONArray,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject,
        parentHasHeight: Boolean = false
    ) {
        for (i in 0 until children.length())
            RenderNodeRow(children.getJSONObject(i), bitmaps, remoteData, parentHasHeight)
    }

    @Composable
    private fun RowScope.RenderNodeRow(
        node: JSONObject,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject,
        parentHasHeight: Boolean = false
    ) {
        if (isHidden(node, remoteData)) return
        val type = node.optString("type")

        if (type == "spacer") {
            var mod: GlanceModifier = GlanceModifier
            val width = node.optInt("width", -1)
            if (width > 0) mod = mod.width(width.dp) else mod = mod.defaultWeight()
            val height = node.optInt("height", -1)
            if (height > 0) mod = mod.height(height.dp)
            Spacer(modifier = mod)
            return
        }

        val override  = overrideFor(node, remoteData)
        val linkMod   = ModifierWithLink(node, remoteData, GlanceModifier)
        val alignStr  = override?.optString("alignment")?.takeIf { override.has("alignment") }
                        ?: node.optString("alignment", "")
        val alignment = if (alignStr.isNotEmpty()) parseAlignment(alignStr) else null

        val isText           = type == "text"
        val isContainer      = type == "container"
        val hasExplicitWidth = node.has("width") || (override?.has("width") == true)

        val shouldFlex = (isContainer || isText) && !hasExplicitWidth

        if (alignment != null) {
            val boxMod = GlanceModifier
                .run { if (parentHasHeight) fillMaxHeight() else this }
                .run { if (shouldFlex) defaultWeight() else this }
            Box(modifier = boxMod, contentAlignment = alignment) {
                RenderLeafOrContainer(type, node, bitmaps, remoteData, linkMod)
            }
        } else {
            val itemMod = when {
                !shouldFlex -> linkMod
                isContainer ->
                    if (parentHasHeight) linkMod.defaultWeight().fillMaxHeight()
                    else                 linkMod.defaultWeight()
                else -> linkMod.defaultWeight()
            }
            RenderLeafOrContainer(type, node, bitmaps, remoteData, itemMod)
        }
    }

    @Composable
    private fun RenderLeafOrContainer(
        type: String,
        node: JSONObject,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject,
        modifier: GlanceModifier
    ) {
        when (type) {
            "text"      -> RenderText(node, remoteData, modifier)
            "image"     -> RenderImage(node, bitmaps, remoteData, modifier)
            "container" -> RenderLayout(node, bitmaps, remoteData, isRoot = false, modifier = modifier)
        }
    }

    // MARK: Box children

    @Composable
    private fun RenderChildrenBox(
        children: JSONArray,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject
    ) {
        for (i in 0 until children.length())
            RenderNodeBox(children.getJSONObject(i), bitmaps, remoteData)
    }

    @Composable
    private fun RenderNodeBox(
        node: JSONObject,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject
    ) {
        if (isHidden(node, remoteData)) return
        val alignment    = parseAlignment(node.optString("alignment", "center"))
        val baseModifier = ModifierWithLink(node, remoteData, GlanceModifier.fillMaxSize())
        Box(modifier = baseModifier, contentAlignment = alignment) {
            when (node.optString("type")) {
                "text"      -> RenderText(node, remoteData, GlanceModifier)
                "image"     -> RenderImage(node, bitmaps, remoteData, GlanceModifier)
                "container" -> RenderLayout(node, bitmaps, remoteData, isRoot = false)
            }
        }
    }

    // MARK: Leaf renderers

    @Composable
    private fun RenderText(
        node: JSONObject,
        remoteData: JSONObject,
        modifier: GlanceModifier = GlanceModifier
    ) {
        val override = overrideFor(node, remoteData)
        val valueRaw = override?.optString("value")?.takeIf { override.has("value") }
                       ?: node.optString("value", "")

        val isEmpty = valueRaw.isEmpty()
        val value   = if (isEmpty) "88" else valueRaw

        val colorStringRaw = override?.optString("color")?.takeIf { override.has("color") }
                             ?: node.optString("color", "#000000")

        val opacity = if (isEmpty) 0.0 else {
            (override?.optDouble("opacity").takeIf { override?.has("opacity") == true }
                ?: node.optDouble("opacity", 1.0)).coerceIn(0.0, 1.0)
        }

        val baseColor     = if (isEmpty) Color.Transparent else safeParseColor(colorStringRaw, android.graphics.Color.BLACK)
        val resolvedColor = when {
            isEmpty       -> Color.Transparent
            opacity < 1.0 -> baseColor.copy(alpha = (baseColor.alpha * opacity.toFloat()))
            else          -> baseColor
        }

        val fontSize = (override?.optDouble("fontSize").takeIf { override?.has("fontSize") == true }
                        ?: node.optDouble("fontSize", 16.0)).sp

        val fontWeight = parseFontWeight(
            override?.optString("fontWeight")?.takeIf { override.has("fontWeight") }
                ?: node.optString("fontWeight", "regular")
        )

        val textAlignment = override?.optString("textAlignment")?.takeIf { override.has("textAlignment") }
                            ?: node.optString("textAlignment", "start")

        val finalModifier = if (textAlignment == "center") modifier.fillMaxWidth() else modifier

        Text(
            text  = value,
            style = TextStyle(
                fontSize   = fontSize,
                fontWeight = fontWeight,
                color      = ColorProvider(resolvedColor),
                textAlign  = when (textAlignment) {
                    "center"   -> TextAlign.Center
                    "trailing" -> TextAlign.End
                    else       -> TextAlign.Start
                }
            ),
            modifier = finalModifier
        )
    }

    @Composable
    private fun RenderImage(
        node: JSONObject,
        bitmaps: Map<String, Bitmap>,
        remoteData: JSONObject,
        modifier: GlanceModifier = GlanceModifier
    ) {
        val override     = overrideFor(node, remoteData)
        val src          = override?.optString("src")?.takeIf { override.has("src") }
                           ?: node.optString("src", "")
        val isBackground = node.optBoolean("isBackground", false)
        val fillHeight   = node.optBoolean("fillHeight", false)
        val contentMode  = if (node.optString("contentMode") == "fill") ContentScale.Crop else ContentScale.Fit

        val opacity = (override?.optDouble("opacity").takeIf { override?.has("opacity") == true }
                       ?: node.optDouble("opacity", 1.0)).coerceIn(0.0, 1.0).toFloat()

        val finalModifier = when {
            isBackground -> modifier.fillMaxSize()
            fillHeight   -> modifier.width(node.optInt("width", 80).dp).fillMaxHeight()
            else         -> modifier.size(node.optInt("width", 50).dp, node.optInt("height", 50).dp)
        }

        val rawBitmap   = bitmaps[src]
        val finalBitmap = when {
            rawBitmap == null -> null
            opacity < 1f      -> applyOpacityToBitmap(rawBitmap, opacity)
            else              -> rawBitmap
        }

        if (finalBitmap != null) {
            Image(
                provider           = ImageProvider(finalBitmap),
                contentDescription = null,
                contentScale       = contentMode,
                modifier           = finalModifier
            )
        } else {
            Spacer(modifier = finalModifier.background(if (isBackground) Color.DarkGray else Color.Transparent))
        }
    }

    // MARK: Utilities

    private fun extractImageUrls(children: JSONArray?, remoteData: JSONObject, urls: MutableSet<String>) {
        children ?: return
        for (i in 0 until children.length()) {
            val node     = children.getJSONObject(i)
            if (isHidden(node, remoteData)) continue
            val override = overrideFor(node, remoteData)
            when (node.optString("type")) {
                "image" -> {
                    val src = override?.optString("src")?.takeIf { override.has("src") }
                              ?: node.optString("src")
                    if (src.isNotEmpty()) urls.add(src)
                }
                "container" -> extractImageUrls(node.optJSONArray("children"), remoteData, urls)
            }
        }
    }

    private fun ModifierWithLink(node: JSONObject, remoteData: JSONObject, modifier: GlanceModifier): GlanceModifier {
        val override = overrideFor(node, remoteData)
        val link     = override?.optString("link")?.takeIf { override.has("link") }
                       ?: node.optString("link", "")
        return if (link.isNotEmpty())
            modifier.clickable(
                actionStartActivity(
                    Intent(Intent.ACTION_VIEW, Uri.parse(link)).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                )
            )
        else modifier
    }

    private fun safeParseColor(colorString: String, default: Int = android.graphics.Color.WHITE): Color {
        if (colorString.equals("transparent", ignoreCase = true)) return Color.Transparent
        return try { Color(android.graphics.Color.parseColor(colorString)) } catch (e: Exception) { Color(default) }
    }

    private fun parseFontWeight(weight: String): FontWeight = when (weight) {
        "ultraLight", "thin", "light"        -> FontWeight.Normal
        "medium"                             -> FontWeight.Medium
        "semibold", "bold", "heavy", "black" -> FontWeight.Bold
        else                                 -> FontWeight.Normal
    }

    private fun applyOpacityToBitmap(src: Bitmap, opacity: Float): Bitmap {
        val result = Bitmap.createBitmap(src.width, src.height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(result)
        val paint  = Paint().apply { alpha = (opacity * 255).toInt().coerceIn(0, 255) }
        canvas.drawBitmap(src, 0f, 0f, paint)
        return result
    }

    private suspend fun downloadBitmap(context: Context, urlString: String): Bitmap? = withContext(Dispatchers.IO) {
        try {
            if (urlString.isEmpty()) return@withContext null
            var dataToLoad: Any = urlString
            if (urlString.startsWith("shared://")) {
                val file = java.io.File(context.filesDir, urlString.removePrefix("shared://"))
                if (file.exists()) dataToLoad = file else return@withContext null
            } else if (urlString.startsWith("file://")) {
                val file = java.io.File(urlString.removePrefix("file://"))
                if (file.exists()) dataToLoad = file
            }
            val request = ImageRequest.Builder(context)
                .data(dataToLoad)
                .addHeader("User-Agent", "DynamicWidgetApp/1.0 (Android)")
                .size(600).allowHardware(false)
                .memoryCachePolicy(CachePolicy.DISABLED)
                .diskCachePolicy(CachePolicy.DISABLED)
                .build()
            val result = context.imageLoader.execute(request)
            if (result is SuccessResult) (result.drawable as? BitmapDrawable)?.bitmap else null
        } catch (e: Exception) { null }
    }

    private fun parseAlignment(align: String): Alignment = when (align) {
        "topLeading",    "topLeft"      -> Alignment.TopStart
        "topCenter"                     -> Alignment.TopCenter
        "topTrailing",   "topRight"     -> Alignment.TopEnd
        "centerLeading", "centerLeft"   -> Alignment.CenterStart
        "center"                        -> Alignment.Center
        "centerTrailing","centerRight"  -> Alignment.CenterEnd
        "bottomLeading", "bottomLeft"   -> Alignment.BottomStart
        "bottomCenter"                  -> Alignment.BottomCenter
        "bottomTrailing","bottomRight"  -> Alignment.BottomEnd
        else                            -> Alignment.Center
    }
}