package com.luminous5972.StickerSmash;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.graphics.drawable.Icon;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class LiveTimerModule extends ReactContextBaseJavaModule {
    private static final String CHANNEL_ID = "timer_channel";
    private final Handler updateHandler = new Handler(Looper.getMainLooper());
    private final Map<String, Runnable> activeTimers = new HashMap<>();

    public LiveTimerModule(ReactApplicationContext context) { super(context); }

    @NonNull
    @Override
    public String getName() { return "LiveTimer"; }

    @ReactMethod
    public void startLiveActivity(double endTime, String title, String timerId) {
        createNotificationChannel();
        stopLiveActivity(timerId);

        final long startTime = System.currentTimeMillis();

        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                updateNotification(endTime, title, timerId, startTime);
                updateHandler.postDelayed(this, 1000);
            }
        };

        activeTimers.put(timerId, runnable);
        updateHandler.post(runnable);
    }

    private void updateNotification(double endTime, String title, String timerId, long startTime) {
        ReactApplicationContext context = getReactApplicationContext();
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        
        int notificationId = timerId.hashCode();
        int progress = (int) Math.round(((System.currentTimeMillis() - startTime) / (endTime - startTime)) * 100);

        if (progress >= 100) {
            stopLiveActivity(timerId);
            return;
        }

        // --- USING YOUR CUSTOM BUILDER LOGIC ---
        if (Build.VERSION.SDK_INT >= 36) { // Android 16+ 
            Notification.ProgressStyle progressStyle = new Notification.ProgressStyle()
                .setProgressPoints(Collections.singletonList(new Notification.ProgressStyle.Point(50)))
                .setProgress(progress)
                .setProgressTrackerIcon(Icon.createWithResource(context, android.R.drawable.ic_media_play));

            Notification.Builder builder = new Notification.Builder(context, CHANNEL_ID)
                .setSmallIcon(context.getApplicationInfo().icon)
                .setContentTitle(title)
                .setOngoing(true)
                .setStyle(progressStyle)
                .setWhen((long) endTime)
                .setShowWhen(true)
                .setUsesChronometer(true)
                .setChronometerCountDown(true);

            // This ensures the system treats it as a "Live Activity" style notification
            builder.getExtras().putBoolean("android.requestPromotedOngoing", true);
            manager.notify(notificationId, builder.build());
            
        } else {
            // Fallback for older Android versions
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(context.getApplicationInfo().icon)
                .setContentTitle(title)
                .setOngoing(true)
                .setProgress(100, progress, false)
                .setWhen((long) endTime)
                .setUsesChronometer(true)
                .setChronometerCountDown(true)
                .setPriority(NotificationCompat.PRIORITY_LOW);

            manager.notify(notificationId, builder.build());
        }
    }

    @ReactMethod
    public void stopLiveActivity(String timerId) {
        Runnable runnable = activeTimers.remove(timerId);
        if (runnable != null) updateHandler.removeCallbacks(runnable);
        
        NotificationManager manager = (NotificationManager) getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) manager.cancel(timerId.hashCode());
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = (NotificationManager) getReactApplicationContext().getSystemService(NotificationManager.class);
            if (manager != null && manager.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Active Timers", NotificationManager.IMPORTANCE_LOW);
                manager.createNotificationChannel(channel);
            }
        }
    }
}