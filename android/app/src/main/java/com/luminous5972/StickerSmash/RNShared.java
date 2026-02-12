package com.luminous5972.StickerSmash;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import android.content.Context;

public class RNShared extends ReactContextBaseJavaModule {
    ReactApplicationContext context;

    public RNShared(ReactApplicationContext reactContext) {
        super(reactContext);
        context = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "RNShared";
    }

    @ReactMethod
    public void setData(String key, String data, Callback callback) {
        SharedPreferences.Editor editor = context.getSharedPreferences("DATA", Context.MODE_PRIVATE).edit();
        editor.putString(key, data);
        editor.commit();

        Intent intent = new Intent(context, NewAppWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);

        int[] ids = AppWidgetManager.getInstance(context)
                .getAppWidgetIds(new ComponentName(context, NewAppWidget.class));

        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);

        if (callback != null) {
            callback.invoke("Success");
        }
    }

}
