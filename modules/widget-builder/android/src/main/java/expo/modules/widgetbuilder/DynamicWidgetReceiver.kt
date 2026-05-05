package expo.modules.widgetbuilder

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

class Slot0Widget : DynamicWidget("slot0")
class Slot1Widget : DynamicWidget("slot1")
class Slot2Widget : DynamicWidget("slot2")
class Slot3Widget : DynamicWidget("slot3")
class Slot4Widget : DynamicWidget("slot4")

class Slot0WidgetReceiver : GlanceAppWidgetReceiver() { override val glanceAppWidget: GlanceAppWidget = Slot0Widget() }
class Slot1WidgetReceiver : GlanceAppWidgetReceiver() { override val glanceAppWidget: GlanceAppWidget = Slot1Widget() }
class Slot2WidgetReceiver : GlanceAppWidgetReceiver() { override val glanceAppWidget: GlanceAppWidget = Slot2Widget() }
class Slot3WidgetReceiver : GlanceAppWidgetReceiver() { override val glanceAppWidget: GlanceAppWidget = Slot3Widget() }
class Slot4WidgetReceiver : GlanceAppWidgetReceiver() { override val glanceAppWidget: GlanceAppWidget = Slot4Widget() }