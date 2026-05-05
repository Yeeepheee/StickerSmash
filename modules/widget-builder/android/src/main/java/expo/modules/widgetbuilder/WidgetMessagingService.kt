package expo.modules.widgetbuilder

import android.util.Log
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class WidgetMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        Log.d("WIDGET_FCM", "Message received from: ${remoteMessage.from}")

        if (remoteMessage.data["action"] == "UPDATE_WIDGET") {
            // Optionally target a specific slot via FCM data payload:
            // { "action": "UPDATE_WIDGET", "widgetId": "slot1" }
            val targetSlot = remoteMessage.data["widgetId"] 

            val inputData = if (targetSlot != null) {
                Data.Builder().putString("widgetId", targetSlot).build()
            } else {
                Data.EMPTY 
            }

            Log.d("WIDGET_FCM", "Queueing WidgetUpdateWorker for: ${targetSlot ?: "all slots"}")
            val workRequest = OneTimeWorkRequestBuilder<WidgetUpdateWorker>()
                .setInputData(inputData)
                .build()
            WorkManager.getInstance(this).enqueue(workRequest)
        }
    }

    override fun onNewToken(token: String) {
        Log.d("WIDGET_FCM", "Refreshed token: $token")
    }
}