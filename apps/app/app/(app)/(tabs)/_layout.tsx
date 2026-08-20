import { Tabs } from "expo-router";

import { useTheme } from "@/theme/ThemeProvider";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="dashboard/index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="notifications/index" options={{ title: "Notifications" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", headerShown: false }} />
    </Tabs>
  );
}
