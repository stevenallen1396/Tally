import { formatAbs } from "@tally/shared";
import { FlatList, View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/theme/ThemeProvider";

import { TAB_BAR_CLEARANCE } from "../_layout";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default function Notifications() {
  const { colors } = useTheme();
  const { notifications, loading } = useNotifications();

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
        <ThemedText preset="headingScreen" color="debit">
          Activity
        </ThemedText>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListEmptyComponent={
          loading ? null : (
            <View style={{ paddingTop: 60, alignItems: "center" }}>
              <ThemedText preset="body" color="secondary">
                You&apos;re all caught up.
              </ThemedText>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isEven = item.amountMinor === 0;
          const isCredit = (item.amountMinor ?? 0) >= 0;
          const amountColor = isEven ? colors.textSecondary : isCredit ? colors.credit : colors.debit;
          const amountBg = isEven ? colors.background : isCredit ? colors.creditBg : colors.debitBg;
          // Membership events aren't "about" an entry from the other
          // person, so there's no reliable partner name to head them with
          // (member_left in particular — the other member's tally_members
          // row is already gone by the time this notification exists).
          const isMembershipEvent = item.type === "member_left" || item.type === "member_joined";
          const header = isMembershipEvent ? item.title : (item.partnerName ?? "your buddy");
          const subtitle = isMembershipEvent ? item.body : (item.description ?? item.body);

          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <ThemedText preset="bodyEmphasis" style={{ fontSize: 17, lineHeight: 22 }}>
                  {header}
                </ThemedText>
                <ThemedText preset="body" color="secondary">
                  {subtitle}
                </ThemedText>
                <ThemedText preset="ledgerMeta" color="secondary">
                  {formatWhen(item.createdAt)}
                </ThemedText>
              </View>
              {item.amountMinor !== null ? (
                <View
                  style={{
                    borderRadius: 10,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    backgroundColor: amountBg,
                  }}
                >
                  <ThemedText preset="ledgerAmount" style={{ color: amountColor }}>
                    {formatAbs(item.amountMinor, item.currency)}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          );
        }}
      />
      {/* A flex sibling, not FlatList padding — see the equivalent comment
          on the dashboard's list for why. */}
      <View style={{ height: TAB_BAR_CLEARANCE }} />
    </Screen>
  );
}
