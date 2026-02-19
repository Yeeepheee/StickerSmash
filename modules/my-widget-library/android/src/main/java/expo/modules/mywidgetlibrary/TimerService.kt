package expo.modules.mywidgetlibrary

import android.app.*
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.drawable.Icon
import android.os.*
import androidx.core.app.NotificationCompat
import java.util.Collections
import java.util.concurrent.ConcurrentHashMap

class TimerService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private val CHANNEL_ID = "timer_channel"
    
    // Track the logic and the data needed to rebuild notifications
    private val activeTrackers = ConcurrentHashMap<String, Runnable>()
    private val timerData = ConcurrentHashMap<String, TimerDetails>()

    data class TimerDetails(val endTime: Double, val title: String, val startTime: Long)

    companion object {
        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Timer Service Channel",
                NotificationManager.IMPORTANCE_LOW // Low priority prevents annoying sounds every update
            ).apply {
                description = "Used for active timers"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val timerId = intent?.getStringExtra("timerId") ?: return START_NOT_STICKY
        
        when (intent.action) {
            ACTION_STOP -> stopIndividualTimer(timerId)
            ACTION_START -> {
                val details = TimerDetails(
                    endTime = intent.getDoubleExtra("endTime", 0.0),
                    title = intent.getStringExtra("title") ?: "Timer",
                    startTime = intent.getLongExtra("startTime", System.currentTimeMillis())
                )
                startTracking(timerId, details)
            }
        }
        return START_STICKY
    }

    private fun startTracking(timerId: String, details: TimerDetails) {
        val notificationId = timerId.hashCode()
        timerData[timerId] = details

        val runnable = object : Runnable {
            override fun run() {
                val notification = buildTimerNotification(timerId)
                val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                manager.notify(notificationId, notification)

                if (System.currentTimeMillis() < (timerData[timerId]?.endTime ?: 0.0)) {
                    handler.postDelayed(this, 1000)
                } else {
                    stopIndividualTimer(timerId)
                }
            }
        }

        // Only call startForeground if this is the first timer
        if (activeTrackers.isEmpty()) {
            val notification = buildTimerNotification(timerId)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(notificationId, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
            } else {
                startForeground(notificationId, notification)
            }
        }

        activeTrackers[timerId] = runnable
        handler.post(runnable)
    }

    private fun stopIndividualTimer(timerId: String) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        activeTrackers[timerId]?.let { handler.removeCallbacks(it) }
        activeTrackers.remove(timerId)
        timerData.remove(timerId)
        manager.cancel(timerId.hashCode())

        if (activeTrackers.isEmpty()) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        } else {
            // HANDOVER: Promote the next available timer to be the Foreground Anchor
            val nextId = activeTrackers.keys.first()
            val notification = buildTimerNotification(nextId)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(nextId.hashCode(), notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
            } else {
                startForeground(nextId.hashCode(), notification)
            }
        }
    }

    private fun buildTimerNotification(timerId: String): Notification {
        val data = timerData[timerId] ?: return Notification()
        val progress = (((System.currentTimeMillis() - data.startTime).toDouble() / (data.endTime - data.startTime)) * 100).toInt().coerceIn(0, 100)

        val stopIntent = Intent(this, TimerService::class.java).apply {
            action = ACTION_STOP
            putExtra("timerId", timerId)
        }
        val pendingStopIntent = PendingIntent.getService(
            this, timerId.hashCode(), stopIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return if (Build.VERSION.SDK_INT >= 36) {
            val progressStyle = Notification.ProgressStyle()
                .setProgress(progress)

            Notification.Builder(this, CHANNEL_ID)
                .setSmallIcon(applicationInfo.icon)
                .setContentTitle(data.title)
                .setOngoing(true)
                .setStyle(progressStyle)
                .setWhen(data.endTime.toLong())
                .setShowWhen(true)
                .setUsesChronometer(true)
                .setChronometerCountDown(true)
                .apply { extras.putBoolean("android.requestPromotedOngoing", true) }
                .build()
        } else {
            NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(applicationInfo.icon)
                .setContentTitle(data.title)
                .setOngoing(true)
                .setProgress(100, progress, false)
                .setWhen(data.endTime.toLong())
                .setUsesChronometer(true)
                .setChronometerCountDown(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build()
        }
    }

    override fun onDestroy() {
        activeTrackers.values.forEach { handler.removeCallbacks(it) }
        super.onDestroy()
    }
}