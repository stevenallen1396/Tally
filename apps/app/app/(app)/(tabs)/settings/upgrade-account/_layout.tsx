import { Stack } from "expo-router";

import { SmartBackButton } from "@/components/SmartBackButton";
import { useStackHeaderOptions } from "@/theme/stackHeaderOptions";

export default function UpgradeAccountLayout() {
  const headerOptions = useStackHeaderOptions();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        ...headerOptions,
        headerLeft: () => (
          <SmartBackButton fallbackHref="/(app)/(tabs)/settings" />
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Your email" }} />
      <Stack.Screen name="password" options={{ title: "Choose a password" }} />
      <Stack.Screen name="display-name" options={{ title: "Your name" }} />
      <Stack.Screen name="profile-picture" options={{ title: "Profile picture" }} />
    </Stack>
  );
}
