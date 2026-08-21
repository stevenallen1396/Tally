import { useRouter } from "expo-router";
import { FlatList, Pressable, View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/theme/ThemeProvider";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function Notifications() {
  const { colors } = useTheme();
  const router = useRouter();
  const { notifications, loading, markRead } = useNotifications();

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
        <ThemedText preset="headingScreen">Notifications</ThemedText>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          loading ? null : (
            <View style={{ paddingTop: 60, alignItems: "center" }}>
              <ThemedText preset="body" color="secondary">
                You&apos;re all caught up.
              </ThemedText>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (!item.readAt) markRead(item.id);
              if (item.tallyId) router.push(`/(app)/tally/${item.tallyId}`);
            }}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginTop: 6,
                backgroundColor: item.readAt ? "transparent" : colors.accentPrimary,
              }}
            />
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText preset="bodyEmphasis">{item.title}</ThemedText>
              <ThemedText preset="body" color="secondary">
                {item.body}
              </ThemedText>
              <ThemedText preset="ledgerMeta" color="secondary">
                {formatWhen(item.createdAt)}
              </ThemedText>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}
