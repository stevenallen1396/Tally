import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Animated, FlatList, Pressable, View } from "react-native";

import { ActivityTicker } from "@/components/ActivityTicker";
import { Button } from "@/components/Button";
import { NedAiIcon } from "@/components/NedAiIcon";
import { Screen } from "@/components/Screen";
import { TallyCard } from "@/components/TallyCard";
import { ThemedText } from "@/components/ThemedText";
import { useTallies } from "@/hooks/useTallies";
import { supabase } from "@/lib/supabase";
import { fontFamilies } from "@/theme/typography";
import { useTheme } from "@/theme/ThemeProvider";

export default function Dashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { tallies, loading, refetch } = useTallies();
  const [pressScale] = useState(() => new Animated.Value(1));

  const onAiPressIn = () => Animated.spring(pressScale, { toValue: 0.92, useNativeDriver: true, speed: 40 }).start();
  const onAiPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={tallies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 240, gap: 12 }}
          ListHeaderComponent={
            <View style={{ paddingBottom: 16, gap: 4 }}>
              <ThemedText
                preset="headingScreen"
                style={{ fontFamily: fontFamilies.genty, fontSize: 40, lineHeight: 50, color: colors.debit }}
              >
                Tallis
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            loading ? null : (
              <View style={{ paddingTop: 60, alignItems: "center", gap: 8 }}>
                <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
                  No tallis yet. Start one with a friend to keep track of what you owe each other.
                </ThemedText>
              </View>
            )
          }
          renderItem={({ item }) => (
            <TallyCard
              data={item}
              onPress={() => {
                if (item.closed) {
                  supabase.rpc("leave_tally", { p_tally_id: item.id }).then(refetch);
                } else {
                  router.push(`/(app)/tally/${item.id}`);
                }
              }}
            />
          )}
        />
      </View>
      {/* Bottom stack, lowest to highest: ticker (flush at the screen edge)
          → nav bar (see _layout.tsx, offset to clear the ticker) → AI
          button (offset to clear the nav bar) → CTA section (fixed 30px
          above the AI button, not scrolling with the list). Each gap is
          deliberate — keep them in sync if any of the three heights change. */}
      <View>
        <View style={{ position: "absolute", left: 20, right: 20, bottom: 205, gap: 4 }}>
          <Link href="/(app)/tally/new" asChild>
            <Button label="Start a talli" />
          </Link>
          <Pressable
            onPress={() => router.push("/(app)/tally/join")}
            style={{ paddingVertical: 4, alignItems: "center" }}
          >
            <ThemedText preset="body" style={{ color: colors.accentPrimary }}>
              Have a code? Join
            </ThemedText>
          </Pressable>
        </View>
        <Animated.View
          style={{
            position: "absolute",
            right: 20,
            bottom: 105,
            zIndex: 1,
            transform: [{ scale: pressScale }],
          }}
        >
          <Pressable
            onPress={() => router.push("/(app)/chat")}
            onPressIn={onAiPressIn}
            onPressOut={onAiPressOut}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.accentSecondary,
              borderTopWidth: 2,
              borderTopColor: "rgba(255,255,255,0.35)",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <NedAiIcon size={44} />
          </Pressable>
        </Animated.View>
        <ActivityTicker />
      </View>
    </Screen>
  );
}
