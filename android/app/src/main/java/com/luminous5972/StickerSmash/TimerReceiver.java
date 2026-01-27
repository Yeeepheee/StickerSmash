package com.luminous5972.StickerSmash;


import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.app.NotificationManager;

public class TimerReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        if ("STOP_ACTION".equals(action)) {
            // Cancel the notification
            manager.cancel(1);
            // Tell React Native the timer stopped
            LiveTimerModule.sendEvent("onTimerStopped");
        } else if ("RESET_ACTION".equals(action)) {
            // 1. Tell JS to reset the state
            LiveTimerModule.sendEvent("onTimerReset");

            // 2. OPTIONAL: Update the notification visually immediately
            // Calculate new end time (current time + 60 seconds)
            long newEndTime = System.currentTimeMillis() + (60 * 1000);

            // We can call a static method in LiveTimerModule to rebuild the notification
            // or simply cancel it so the user sees it disappear and wait for JS to restart it.
            manager.cancel(1);
        }
    }
}