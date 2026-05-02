package expo.modules.countdownactivity

import android.app.*
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.*
import androidx.core.app.NotificationCompat
import java.util.concurrent.ConcurrentHashMap


class TimerService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private val CHANNEL_ID = "timer_channel"
    
    // 1. WE COMBINED EVERYTHING INTO ONE OBJECT
    data class TimerSession(
        val endTime: Double, 
        val title: String, 
        val startTime: Long,
        var runnable: Runnable? = null
    )

    // 2. NOW WE ONLY NEED ONE MAP
    private val activeTimers = ConcurrentHashMap<String, TimerSession>()

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
                NotificationManager.IMPORTANCE_LOW 
            ).apply {
                description = "Used for active timers"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val timerId = intent.getStringExtra("timerId") ?: return START_NOT_STICKY
                val endTime = intent.getDoubleExtra("endTime", 0.0)
                val title = intent.getStringExtra("title") ?: "Timer"
                val startTime = intent.getLongExtra("startTime", System.currentTimeMillis())
                
                val session = TimerSession(endTime, title, startTime)
                startTracking(timerId, session)
            }
            ACTION_STOP -> {
                val timerId = intent.getStringExtra("timerId")
                if (timerId != null) {
                    stopIndividualTimer(timerId)
                }
            }
        }
        return START_STICKY
    }

    private fun startTracking(timerId: String, session: TimerSession) {
        // Ensure ID is strictly positive and never 0
        val notificationId = (timerId.hashCode() and 0x7FFFFFFF).let { if (it == 0) 1 else it }
        activeTimers[timerId] = session

        val runnable = object : Runnable {
            override fun run() {
                val notification = buildTimerNotification(timerId)
                val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                
                // Only notify if the notification was successfully built
                if (notification != null) {
                    manager.notify(notificationId, notification)
                }

                if (System.currentTimeMillis() < (activeTimers[timerId]?.endTime ?: 0.0)) {
                    handler.postDelayed(this, 1000)
                } else {
                    stopIndividualTimer(timerId)
                }
            }
        }

        session.runnable = runnable

        // Only call startForeground if this is the first timer
        if (activeTimers.size == 1) {
            val notification = buildTimerNotification(timerId) ?: return
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                try {
                    startForeground(notificationId, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
                } catch (e: Exception) {
                    startForeground(notificationId, notification)
                }
            } else {
                startForeground(notificationId, notification)
            }
        }

        // Delay the first tick so manager.notify doesn't instantly override startForeground
        handler.postDelayed(runnable, 1000)
    }

    private fun stopIndividualTimer(timerId: String) {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notificationId = (timerId.hashCode() and 0x7FFFFFFF).let { if (it == 0) 1 else it }
        
        activeTimers[timerId]?.runnable?.let { handler.removeCallbacks(it) }
        activeTimers.remove(timerId)
        manager.cancel(notificationId)

        if (activeTimers.isEmpty()) {
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        } else {
            // Promote the next available timer to be the Foreground Anchor
            val nextId = activeTimers.keys.first()
            val nextNotificationId = (nextId.hashCode() and 0x7FFFFFFF).let { if (it == 0) 1 else it }
            val notification = buildTimerNotification(nextId) ?: return
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                try {
                    startForeground(nextNotificationId, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
                } catch (e: Exception) {
                    startForeground(nextNotificationId, notification)
                }
            } else {
                startForeground(nextNotificationId, notification)
            }
        }
    }

    private fun buildTimerNotification(timerId: String): Notification? {
        val data = activeTimers[timerId] ?: return null
        
        val totalDuration = maxOf(data.endTime - data.startTime, 1.0)
        val elapsed = System.currentTimeMillis() - data.startTime
        val progress = ((elapsed.toDouble() / totalDuration) * 100).toInt().coerceIn(0, 100)

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(applicationInfo.icon)
            .setContentTitle(data.title)
            .setOngoing(true)
            .setProgress(100, progress, false)
            .setWhen(data.endTime.toLong())
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            builder.setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
        }

        return builder.build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        activeTimers.values.forEach { it.runnable?.let { run -> handler.removeCallbacks(run) } }
        activeTimers.clear()
        super.onDestroy()
    }
}