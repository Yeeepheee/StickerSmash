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

public class LiveTimerModule extends ReactContextBaseJavaModule {

    private static final String CHANNEL_ID = "timer_channel";
    private static final int NOTIFICATION_ID = 1;

    // 1. We need a static reference to the context to send events back to JS
    private static ReactApplicationContext reactContext;

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
    public void startLiveActivity(double endTime) { // endTime should be a timestamp in the future
        ReactApplicationContext context = getReactApplicationContext();
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        // Create Channel (Required for Android 8+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "Timer Updates", NotificationManager.IMPORTANCE_HIGH
            );
            manager.createNotificationChannel(channel);
        }

// --- FIX THESE LINES ---
        Intent stopIntent = new Intent(context, TimerReceiver.class);
        stopIntent.setAction("STOP_ACTION");

        Intent resetIntent = new Intent(context, TimerReceiver.class);
        resetIntent.setAction("RESET_ACTION"); // Previously you had stopIntent.setAction here!

// You MUST create two distinct PendingIntents with different request codes (0 and 1)
        PendingIntent stopPendingIntent = PendingIntent.getBroadcast(
                context, 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent resetPendingIntent = PendingIntent.getBroadcast(
                context, 1, resetIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );


        int progress = calculateProgress(0, endTime);

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
        NotificationManager manager = (NotificationManager) getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        manager.cancel(NOTIFICATION_ID);


    }
    private int calculateProgress(double startTime, double endTime) {
        double currentTime = (double) System.currentTimeMillis();

        if (currentTime >= endTime) return 100;
        if (currentTime <= startTime) return 0;

        double totalDuration = endTime - startTime;
        double elapsed = currentTime - startTime;

        // Convert to a 0-100 scale for the progress bar
        double percentage = (elapsed / totalDuration) * 100;

        return (int) Math.round(percentage);
    }
}