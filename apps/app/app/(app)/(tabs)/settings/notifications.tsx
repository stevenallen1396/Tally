import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform, Switch, View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/lib/SessionProvider";
import { registerForPushNotifications, unregisterForPushNotifications } from "@/lib/pushNotifications";
import { useTheme } from "@/theme/ThemeProvider";

const unsupported = Platform.OS === "web";

export default function NotificationSettings() {
  const { colors } = useTheme();
  const { session } = useSession();
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (unsupported) return;
    Notifications.getPermissionsAsync().then(({ status }) => setPushEnabled(status === "granted"));
  }, []);

  const handleToggle = async (value: boolean) => {
    if (!session) return;
    setPushEnabled(value);
    if (value) {
      await registerForPushNotifications(session.user.id);
    } else {
      await unregisterForPushNotifications();
    }
  };

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
            {unsupported
              ? "Not available on web — use the app on your phone."
              : "New entries and settlement requests from your tally partners."}
          </ThemedText>
        </View>
        <Switch
          value={pushEnabled}
          onValueChange={handleToggle}
          disabled={unsupported}
          trackColor={{ true: colors.accentPrimary, false: colors.border }}
        />
      </View>
    </Screen>
  );
}
