import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests permission and registers this device's Expo push token for the
 * current user. No-ops (rather than throwing) on web, on a simulator, or
 * when no EAS project ID is configured yet (`eas init` hasn't been run) —
 * all real prerequisites for a physical-device push token that aren't in
 * place until EAS is set up.
 */
export async function registerForPushNotifications(userId: string): Promise<void> {
  if (Platform.OS === "web" || !Device.isDevice) return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

  await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      expo_push_token: expoPushToken,
      device_info: `${Device.modelName ?? "unknown"} / ${Platform.OS}`,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "expo_push_token" },
  );
}

/** Removes this device's push token, e.g. when the user disables notifications. */
export async function unregisterForPushNotifications(): Promise<void> {
  if (Platform.OS === "web" || !Device.isDevice) return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
  await supabase.from("push_tokens").delete().eq("expo_push_token", expoPushToken);
}
