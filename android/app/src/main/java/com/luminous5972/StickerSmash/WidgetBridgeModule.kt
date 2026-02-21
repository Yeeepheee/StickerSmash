package com.luminous5972.StickerSmash

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

class WidgetBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetBridge"

    @ReactMethod
    fun saveWidgetSchema(json: String, promise: Promise) {
        try {

            val prefs = reactApplicationContext.getSharedPreferences("WIDGET_PREFS", Context.MODE_PRIVATE)
            prefs.edit().putString("widget_schema", json).apply()

            MainScope().launch {
                DynamicWidget().updateAll(reactApplicationContext)
            }

            promise.resolve("success")
        } catch (e: Exception) {
            promise.reject("E_WIDGET_ERROR", e.message)
        }
    }
}