package expo.modules.widgetbuilder

import android.util.Log
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class WidgetMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        Log.d("WIDGET_FCM", "Message received from: ${remoteMessage.from}")

        if (remoteMessage.data["action"] == "UPDATE_WIDGET") {
            Log.d("WIDGET_FCM", "Queueing WidgetUpdateWorker...")
            val workRequest = OneTimeWorkRequestBuilder<WidgetUpdateWorker>().build()
            WorkManager.getInstance(this).enqueue(workRequest)
        }
    }

    override fun onNewToken(token: String) {
        Log.d("WIDGET_FCM", "Refreshed token: $token")
    }
}