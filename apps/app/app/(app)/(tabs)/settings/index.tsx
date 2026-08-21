import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { Screen } from "@/components/Screen";
import { SettingsRow } from "@/components/SettingsRow";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";
import { useThemeStore, type ThemePreference } from "@/stores/themeStore";
import { useTheme } from "@/theme/ThemeProvider";

const THEME_OPTIONS: {
  value: ThemePreference;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { value: "light", icon: "sunny-outline", label: "Light" },
  { value: "dark", icon: "moon-outline", label: "Dark" },
  { value: "system", icon: "contrast-outline", label: "System" },
];

function AppearanceToggle() {
  const { colors } = useTheme();
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  return (
    <View style={{ gap: 8 }}>
      <View
        accessibilityLabel="Appearance"
        style={{
          flexDirection: "row",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        {THEME_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setPreference(option.value)}
            accessibilityLabel={option.label}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              backgroundColor: preference === option.value ? colors.accentPrimary : colors.surface,
            }}
          >
            <Ionicons
              name={option.icon}
              size={20}
              color={preference === option.value ? "#FFFDF8" : colors.textPrimary}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function SettingsIndex() {
  const router = useRouter();
  const { session } = useSession();
  const isGuest = session?.user.is_anonymous ?? false;

  return (
    <Screen style={{ gap: 12 }}>
      {isGuest ? (
        <SettingsRow
          label="You're a guest — save your account"
          onPress={() => router.push("/(app)/(tabs)/settings/upgrade-account")}
        />
      ) : null}
      <SettingsRow label="Profile" onPress={() => router.push("/(app)/(tabs)/settings/profile")} />
      <SettingsRow
        label="Notifications"
        onPress={() => router.push("/(app)/(tabs)/settings/notifications")}
      />
      <AppearanceToggle />
      <View style={{ flex: 1 }} />
      <View style={{ gap: 4, marginBottom: 75 }}>
        <ThemedText preset="ledgerMeta" color="secondary" style={{ textAlign: "center" }}>
          Tally, part of Folio
        </ThemedText>
        <Pressable onPress={() => supabase.auth.signOut()} style={{ alignSelf: "center", paddingVertical: 4 }}>
          <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
            Sign out
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}
