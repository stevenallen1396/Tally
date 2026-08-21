import { Stack } from "expo-router";

import { useStackHeaderOptions } from "@/theme/stackHeaderOptions";

export default function AuthLayout() {
  const headerOptions = useStackHeaderOptions();

  return <Stack screenOptions={{ headerShown: false, ...headerOptions }} />;
}
