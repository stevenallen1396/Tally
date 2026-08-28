import { formatAbs } from "@tally/shared";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import { useNotifications, type NotificationItem } from "@/hooks/useNotifications";
import { tokens } from "@/theme/tokens";
import { useTheme } from "@/theme/ThemeProvider";

import { CoinGlyphIcon } from "./CoinGlyphIcon";

// Fixed Warm Charcoal / Canvas Cream regardless of app theme — same pattern
// as the nav bar pill (see app/(app)/(tabs)/_layout.tsx).
const STRIP_BACKGROUND = tokens.light.textPrimary;
const ITEM_COLOR = tokens.light.background;

const EMPTY_TIPS = ["Invite a friend to split costs", "Add your first expense to get started"];

// Pixels per second — a comfortable, readable chyron pace.
const SCROLL_SPEED = 40;

function isMoneyEvent(item: NotificationItem) {
  return item.type !== "member_left" && item.type !== "member_joined" && item.amountMinor !== null;
}

type TickerEntry = { key: string; label: string; amount: string | null };

export function ActivityTicker() {
  const router = useRouter();
  const { typography, colors } = useTheme();
  const { notifications } = useNotifications();
  const [rowWidth, setRowWidth] = useState(0);
  const [translateX] = useState(() => new Animated.Value(0));
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const entries = useMemo<TickerEntry[]>(() => {
    const moneyEvents = notifications.filter(isMoneyEvent).slice(0, 15);
    if (moneyEvents.length === 0) {
      return EMPTY_TIPS.map((tip, i) => ({ key: `tip-${i}`, label: tip, amount: null }));
    }
    return moneyEvents.map((item) => ({
      key: item.id,
      label: item.title,
      amount: item.amountMinor !== null ? formatAbs(item.amountMinor, item.currency) : null,
    }));
  }, [notifications]);

  const loop = () => {
    if (rowWidth === 0) return null;
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -rowWidth,
        duration: (rowWidth / SCROLL_SPEED) * 1000,
        useNativeDriver: false,
      }),
    );
    animation.start();
    return animation;
  };

  useEffect(() => {
    translateX.setValue(0);
    animationRef.current = loop();
    return () => animationRef.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loop() intentionally re-reads rowWidth/translateX by closure
  }, [rowWidth]);

  const pause = () => animationRef.current?.stop();
  const resume = () => {
    animationRef.current = loop();
  };

  const row = (measure: boolean) => (
    <View
      style={{ flexDirection: "row", alignItems: "center" }}
      onLayout={measure ? (e) => setRowWidth(e.nativeEvent.layout.width) : undefined}
    >
      {entries.map((entry) => (
        <View key={entry.key} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14 }}>
          <Text style={[typography.ticker.item, { color: ITEM_COLOR }]}>{entry.label}</Text>
          {entry.amount ? (
            <Text style={[typography.ticker.amount, { color: colors.accentSecondary }]}>{entry.amount}</Text>
          ) : null}
          <CoinGlyphIcon size={12} />
        </View>
      ))}
    </View>
  );

  return (
    <Pressable
      onPress={() => router.push("/(app)/(tabs)/notifications")}
      onPressIn={pause}
      onPressOut={resume}
      style={{ height: 40, backgroundColor: STRIP_BACKGROUND, overflow: "hidden", justifyContent: "center" }}
    >
      <Animated.View style={{ flexDirection: "row", transform: [{ translateX }] }}>
        {row(true)}
        {rowWidth > 0 ? row(false) : null}
      </Animated.View>
    </Pressable>
  );
}
