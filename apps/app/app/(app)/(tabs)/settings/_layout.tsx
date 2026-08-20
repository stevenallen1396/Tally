import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="notifications" options={{ title: "Notification settings" }} />
      <Stack.Screen name="upgrade-account" options={{ title: "Save your account" }} />
    </Stack>
  );
}
