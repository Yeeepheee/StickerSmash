package com.luminous5972.StickerSmash;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.drawable.Icon;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Collections;

public class LiveTimerModule extends ReactContextBaseJavaModule {

    private static final String TAG = "LiveTimer";
    private static final String CHANNEL_ID = "timer_channel";
    private static final int NOTIFICATION_ID = 1;
    private static final int UPDATE_INTERVAL_MS = 1000; // Increased for battery efficiency

    private final Handler updateHandler = new Handler(Looper.getMainLooper());
    private Runnable updateRunnable;
    private double startTime;
    private double endTime;

    public LiveTimerModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "LiveTimer";
    }

    /**
     * Sends events to JavaScript.
     * Refactored to non-static to avoid memory leaks with ReactApplicationContext.
     */
    private void sendEvent(String eventName, @Nullable Object params) {
        ReactApplicationContext context = getReactApplicationContextIfActiveOrWarn();
        if (context != null) {
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getReactApplicationContext().getSystemService(NotificationManager.class);
            if (manager != null && manager.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(
                        CHANNEL_ID,
                        "Timer Notifications",
                        NotificationManager.IMPORTANCE_LOW
                );
                channel.setDescription("Shows live timer progress");
                manager.createNotificationChannel(channel);
            }
        }
    }

    private PendingIntent createPendingIntent(String action) {
        Intent intent = new Intent(getReactApplicationContext(), TimerReceiver.class);
        intent.setAction(action);

        // API 31+ requires FLAG_IMMUTABLE or FLAG_MUTABLE
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        return PendingIntent.getBroadcast(getReactApplicationContext(), action.hashCode(), intent, flags);
    }


    @ReactMethod
    public void startLiveActivity(double endTime) {
        createNotificationChannel();
        stopExistingTimer();

        this.startTime = System.currentTimeMillis();
        this.endTime = endTime;

        updateRunnable = new Runnable() {
            @Override
            public void run() {
                updateNotification();
                updateHandler.postDelayed(this, UPDATE_INTERVAL_MS);
            }
        };

        updateHandler.post(updateRunnable);
    }

    private void updateNotification() {
        ReactApplicationContext context = getReactApplicationContext();
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

//        PendingIntent stopPending = createPendingIntent("STOP_ACTION");
//        PendingIntent resetPending = createPendingIntent("RESET_ACTION");

        int progress = calculateProgress(startTime, endTime);

        if (progress >= 100) {
            sendEvent("TimerFinished", null);
            stopLiveActivity();
            return;
        }

        if (Build.VERSION.SDK_INT >= 36) { // Android 16+ ProgressStyle
            Notification.ProgressStyle progressStyle = new Notification.ProgressStyle()
                    .setProgressPoints(Collections.singletonList(new Notification.ProgressStyle.Point(50)))
                    .setProgress(progress)
                    .setProgressTrackerIcon(Icon.createWithResource(context, android.R.drawable.ic_media_play));

            Notification.Builder builder = new Notification.Builder(context, CHANNEL_ID)
                    .setSmallIcon(context.getApplicationInfo().icon)
                    .setContentTitle("Timer Tracking")
                    .setOngoing(true)
                    .setStyle(progressStyle)
                    .setWhen((long) endTime)
                    .setShowWhen(true)
                    .setUsesChronometer(true)
                    .setChronometerCountDown(true);

            builder.getExtras().putBoolean("android.requestPromotedOngoing", true);
//            builder.addAction(new Notification.Action.Builder(null, "Stop", stopPending).build());
//            builder.addAction(new Notification.Action.Builder(null, "Reset", resetPending).build());
            manager.notify(NOTIFICATION_ID, builder.build());
        } else {
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(context.getApplicationInfo().icon)
                    .setContentTitle("Timer Countdown")
                    .setOngoing(true)
                    .setProgress(100, progress, false) // Added progress bar to fallback
                    .setWhen((long) endTime)
                    .setUsesChronometer(true)
                    .setChronometerCountDown(true)
                    .setPriority(NotificationCompat.PRIORITY_LOW);

//            builder.addAction(0, "Stop", stopPending);
//            builder.addAction(0, "Reset", resetPending);
            manager.notify(NOTIFICATION_ID, builder.build());
        }
    }

    @ReactMethod
    public void stopLiveActivity() {
        stopExistingTimer();
        NotificationManager manager = (NotificationManager) getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager != null) {
            manager.cancel(NOTIFICATION_ID);
        }
    }

    private void stopExistingTimer() {
        if (updateRunnable != null) {
            updateHandler.removeCallbacks(updateRunnable);
            updateRunnable = null;
        }
    }

    private int calculateProgress(double start, double end) {
        long now = System.currentTimeMillis();
        if (end <= start || now >= end) return 100;
        if (now <= start) return 0;

        return (int) Math.round(((now - start) / (end - start)) * 100);
    }
}
