package com.luminous5972.StickerSmash;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.view.View;
import android.widget.RemoteViews;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class NewAppWidget extends AppWidgetProvider {

    private Bitmap resizeBitmap(Bitmap bitmap, int maxWidth, int maxHeight) {
        float aspectRatio = (float) bitmap.getWidth() / (float) bitmap.getHeight();
        int width = maxWidth;
        int height = Math.round(width / aspectRatio);

        if (height > maxHeight) {
            height = maxHeight;
            width = Math.round(height * aspectRatio);
        }

        return Bitmap.createScaledBitmap(bitmap, width, height, false);
    }

    void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences sharedPref = context.getSharedPreferences("DATA", Context.MODE_PRIVATE);
        String imageURL = sharedPref.getString("sharedImageUrl", "");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

        final PendingResult pendingResult = goAsync();

        new Thread(() -> {
            try {
                Bitmap bitmap = loadImage(imageURL);

                if (bitmap != null) {
                    Bitmap resized = resizeBitmap(bitmap, 600, 600);
                    Bitmap finalBitmap = resized.copy(Bitmap.Config.RGB_565, false);

                    views.setViewVisibility(R.id.appwidget_image, View.VISIBLE);
                    views.setViewVisibility(R.id.fallback_layout, View.GONE);
                    views.setImageViewBitmap(R.id.appwidget_image, finalBitmap);
                } else {
                    views.setViewVisibility(R.id.appwidget_image, View.GONE);
                    views.setViewVisibility(R.id.fallback_layout, View.VISIBLE);
                }
                appWidgetManager.updateAppWidget(appWidgetId, views);
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                pendingResult.finish();
            }
        }).start();
    }

    private Bitmap loadImage(String src) {
        if (src == null || src.isEmpty()) return null;

        try {
            if (src.startsWith("http")) {
                URL url = new URL(src);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setDoInput(true);
                connection.connect();
                InputStream input = connection.getInputStream();
                return BitmapFactory.decodeStream(input);
            } else {
                String localPath = src.replace("file://", "");
                return BitmapFactory.decodeFile(localPath);
            }
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}
