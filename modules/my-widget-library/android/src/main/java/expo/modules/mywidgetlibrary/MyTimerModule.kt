package expo.modules.mywidgetlibrary

import android.content.Context
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyTimerModule : Module() {
    private val context: Context
        get() = requireNotNull(appContext.reactContext) { "React context is not available" }

    override fun definition() = ModuleDefinition {
        Name("MyTimerModule")

        Function("startLiveActivity") { endTime: Double, title: String, timerId: String ->
            val intent = Intent(context, TimerService::class.java).apply {
                action = TimerService.ACTION_START
                putExtra("endTime", endTime)
                putExtra("title", title)
                putExtra("timerId", timerId)
                putExtra("startTime", System.currentTimeMillis())
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        Function("stopLiveActivity") { timerId: String ->
            val intent = Intent(context, TimerService::class.java).apply {
                action = TimerService.ACTION_STOP
                putExtra("timerId", timerId)
            }
            context.startService(intent)
        }
    }
}