package com.luminous5972.StickerSmash;

import android.app.Notification;
import android.app.Notification.ProgressStyle;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.content.Intent;
import android.app.PendingIntent;
import android.content.Context;
import androidx.core.app.NotificationCompat;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;


public class LiveTimerModule extends ReactContextBaseJavaModule {

    private static final String CHANNEL_ID = "timer_channel";
    private static final int NOTIFICATION_ID = 1;

    // 1. We need a static reference to the context to send events back to JS
    private static ReactApplicationContext reactContext;

    private Handler updateHandler = new Handler(Looper.getMainLooper());
    private Runnable updateRunnable;
    private double endTime;
    private double startTime;

    public LiveTimerModule(ReactApplicationContext context) {
        super(context);
        reactContext = context; // Store the context
    }

    @Override
    public String getName() {
        return "LiveTimer";
    }

    // 2. This is the "sendEvent" method that TimerReceiver was looking for
    public static void sendEvent(String eventName) {
        if (reactContext != null) {
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, null);
        }
    }

    @ReactMethod
    public void startLiveActivity(double endTime) {

        if (updateRunnable != null) {
            updateHandler.removeCallbacks(updateRunnable);
        }

        if (this.endTime != endTime) {
            this.startTime = System.currentTimeMillis();
            this.endTime = endTime;
            Log.d("LiveTimer", "New Timer Detected. Start: " + startTime + " End: " + endTime);
        }

        Log.d("MyTimerTag", "The current progress is: ");
        // Create the runnable that will update the UI
        updateRunnable = new Runnable() {
            @Override
            public void run() {
                updateNotification();
                updateHandler.postDelayed(this, 10);
            }
        };

        // Start the loop
        updateHandler.post(updateRunnable);
    }

    private void updateNotification() {
        ReactApplicationContext context = getReactApplicationContext();
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        int progress = calculateProgress(startTime,endTime);

        // Check if we are done
        if (progress >= 100) {
            stopLiveActivity();
            return;
        }

        if (Build.VERSION.SDK_INT >= 36) {
            Notification.ProgressStyle progressStyle = new Notification.ProgressStyle()
                    .setProgressPoints(java.util.Arrays.asList(new Notification.ProgressStyle.Point(50)))
                    // This moves the bar
                    .setProgress(progress)
                    // Add a tracker icon so you can see it sliding
                    .setProgressTrackerIcon(android.graphics.drawable.Icon.createWithResource(context, android.R.drawable.ic_media_play));

            Notification.Builder builder = new Notification.Builder(context, CHANNEL_ID)
                    .setSmallIcon(context.getApplicationInfo().icon)
                    .setContentTitle("Timer Tracking")
                    .setOngoing(true)
                    .setStyle(progressStyle)
                    // Also update the auto-countdown in the Status Chip
                    .setWhen((long) endTime)
                    .setUsesChronometer(true)
                    .setChronometerCountDown(true);

            builder.getExtras().putBoolean("android.requestPromotedOngoing", true);
            builder.getExtras().putCharSequence("android.shortCriticalText", "In Progress");

            manager.notify(NOTIFICATION_ID, builder.build());
        } else {
            // 3. Fallback: Your existing NotificationCompat code for Android 15 and below
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(context.getApplicationInfo().icon)
                    .setContentTitle("Timer Countdown")
                    .setOngoing(true)
                    .setWhen((long) endTime)
                    .setUsesChronometer(true)
                    .setChronometerCountDown(true)
                    .setPriority(NotificationCompat.PRIORITY_MAX);

            manager.notify(NOTIFICATION_ID, builder.build());
        }
    }

    @ReactMethod
    public void stopLiveActivity() {
        // 1. Stop the loop to save battery!
        if (updateHandler != null && updateRunnable != null) {
            updateHandler.removeCallbacks(updateRunnable);
        }

        // 2. Clear the notification
        NotificationManager manager = (NotificationManager) getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        manager.cancel(NOTIFICATION_ID);
    }

    private int calculateProgress(double start, double end) {
        long now = System.currentTimeMillis();

        if (end <= start) return 100;
        if (now >= end) return 100;
        if (now <= start) return 0;

        double totalDuration = end - start;
        double elapsed = now - start;

        // Math: (Elapsed / Total) * 100
        float percentage = (float) ((elapsed / totalDuration) * 100);

        return Math.round(percentage);
    }
}