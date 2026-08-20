import { useState } from "react";
import { Switch, View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/ThemeProvider";

// TODO(phase 5): persist to a per-user notification preference + register/unregister the Expo push token.
export default function NotificationSettings() {
  const { colors } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);

  return (
    <Screen>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <ThemedText preset="bodyEmphasis">Push notifications</ThemedText>
          <ThemedText preset="ledgerMeta" color="secondary">
            New entries and settlement requests from your tally partners.
          </ThemedText>
        </View>
        <Switch
          value={pushEnabled}
          onValueChange={setPushEnabled}
          trackColor={{ true: colors.accentPrimary, false: colors.border }}
        />
      </View>
    </Screen>
  );
}
