import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Animated, FlatList, Pressable, View } from "react-native";

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
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, gap: 12 }}
          ListHeaderComponent={
            <View style={{ paddingBottom: 16, gap: 4 }}>
              <ThemedText
                preset="headingScreen"
                style={{ fontFamily: fontFamilies.genty, fontSize: 40, lineHeight: 60, color: colors.debit }}
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
        {/* A flex sibling, not FlatList padding — padding on a FlatList's
            style/contentContainerStyle just becomes interior scroll-content
            padding on web, not a shorter box, so it can't stop the list from
            scrolling under the floating buttons. A fixed-height sibling
            genuinely shrinks the FlatList's flex:1 share of the column. */}
        <View style={{ height: 190 }} />
      </View>
      {/* Bottom stack, lowest to highest: nav bar (see _layout.tsx) → CTA
          section (offset to clear the nav bar) → AI button (offset to clear
          the CTA section, not scrolling with the list). Activity ticker
          temporarily removed — offsets here assume it's gone; re-add its
          40px height + 12px gap to each if it comes back. */}
      <View>
        <View style={{ position: "absolute", left: 20, right: 20, bottom: 85, gap: 4 }}>
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
            bottom: 185,
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
      </View>
    </Screen>
  );
}
