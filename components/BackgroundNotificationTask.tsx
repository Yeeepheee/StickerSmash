import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { NewsWidget } from "@/components/widgets/NewsWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";

export const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }: any) => {
  if (error) {
    console.error("[BG TASK] Error:", error);
    return;
  }

  const payload = data?.notification?.request?.content?.data;

  if (payload?.action !== "UPDATE_WIDGET") return;

  const widgetId = payload?.widgetId ?? null;

  try {
    if (!widgetId || widgetId === "slot0") await NewsWidget();
    if (!widgetId || widgetId === "slot1") await WeatherWidget();
    console.log("[BG TASK] Widgets updated successfully");
  } catch (e) {
    console.error("[BG TASK] Widget update failed:", e);
  }
});

export async function registerBackgroundNotificationTask() {
  try {
    await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    console.log("[BG TASK] Registered successfully");
  } catch (e) {
    console.error("[BG TASK] Registration failed:", e);
  }
}