import { Stack } from "expo-router";

import { useStackHeaderOptions } from "@/theme/stackHeaderOptions";

export default function SettingsLayout() {
  const headerOptions = useStackHeaderOptions();

  return (
    <Stack screenOptions={{ headerShown: true, ...headerOptions }}>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="notifications" options={{ title: "Notification settings" }} />
      <Stack.Screen name="upgrade-account" options={{ title: "Save your account" }} />
    </Stack>
  );
}
