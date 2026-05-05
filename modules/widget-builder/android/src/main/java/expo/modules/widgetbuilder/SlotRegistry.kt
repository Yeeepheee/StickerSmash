package expo.modules.widgetbuilder

import android.content.ComponentName
import android.content.Context

object SlotRegistry {

    const val MAX_SLOTS = 5
    private const val PREFS_KEY = "slot_assignments"

    // Maps widgetId -> slot index ("slot1" -> 0, "slot2" -> 1, etc.)
    fun getOrAssignSlot(context: Context, widgetId: String): Int? {
        val prefs = context.getSharedPreferences(PREFS_KEY, Context.MODE_PRIVATE)
        val map   = loadMap(prefs)

        map[widgetId]?.let { return it }

        // Assign next available slot
        val used  = map.values.toSet()
        val index = (0 until MAX_SLOTS).firstOrNull { it !in used } ?: return null // full

        map[widgetId] = index
        saveMap(prefs, map)
        return index
    }

    fun getSlotIndex(context: Context, widgetId: String): Int? {
        val prefs = context.getSharedPreferences(PREFS_KEY, Context.MODE_PRIVATE)
        return loadMap(prefs)[widgetId]
    }

    fun getAllAssigned(context: Context): Map<String, Int> {
        val prefs = context.getSharedPreferences(PREFS_KEY, Context.MODE_PRIVATE)
        return loadMap(prefs)
    }

    fun releaseSlot(context: Context, widgetId: String) {
        val prefs = context.getSharedPreferences(PREFS_KEY, Context.MODE_PRIVATE)
        val map   = loadMap(prefs)
        map.remove(widgetId)
        saveMap(prefs, map)
    }

    fun getWidget(index: Int): DynamicWidget? = when (index) {
        0    -> Slot0Widget()
        1    -> Slot1Widget()
        2    -> Slot2Widget()
        3    -> Slot3Widget()
        4    -> Slot4Widget()
        else -> null
    }

    fun getReceiverClass(index: Int) = when (index) {
        0    -> Slot0WidgetReceiver::class.java
        1    -> Slot1WidgetReceiver::class.java
        2    -> Slot2WidgetReceiver::class.java
        3    -> Slot3WidgetReceiver::class.java
        4    -> Slot4WidgetReceiver::class.java
        else -> null
    }

    private fun loadMap(prefs: android.content.SharedPreferences): MutableMap<String, Int> {
        val json = prefs.getString("map", null) ?: return mutableMapOf()
        return try {
            val obj = org.json.JSONObject(json)
            obj.keys().asSequence().associateWith { obj.getInt(it) }.toMutableMap()
        } catch (e: Exception) { mutableMapOf() }
    }

    private fun saveMap(prefs: android.content.SharedPreferences, map: Map<String, Int>) {
        val obj = org.json.JSONObject()
        map.forEach { (k, v) -> obj.put(k, v) }
        prefs.edit().putString("map", obj.toString()).apply()
    }

    fun enableSlot(context: Context, index: Int) {
        val receiverClass = getReceiverClass(index) ?: return
        context.packageManager.setComponentEnabledSetting(
            ComponentName(context, receiverClass),
            android.content.pm.PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            android.content.pm.PackageManager.DONT_KILL_APP
        )
    }

    fun disableSlot(context: Context, index: Int) {
        val receiverClass = getReceiverClass(index) ?: return
        context.packageManager.setComponentEnabledSetting(
            ComponentName(context, receiverClass),
            android.content.pm.PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            android.content.pm.PackageManager.DONT_KILL_APP
        )
    }
}