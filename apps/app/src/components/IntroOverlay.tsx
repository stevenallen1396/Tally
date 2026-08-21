import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, Easing, Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hasSeenIntro, markIntroSeen } from "@/lib/introStorage";

import { ThemedText } from "./ThemedText";

const WORDMARK_ASPECT_RATIO = 1146 / 667;
const CHARCOAL = "#1E1C19";
const CANVAS_CREAM = "#F4EEDF";
const HOLD_MS = 1300;
const EXIT_MS = 1800;

export function IntroOverlay() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [shouldRender, setShouldRender] = useState(false);
  const [translateY] = useState(() => new Animated.Value(0));
  const [bounce] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;

    hasSeenIntro().then((seen) => {
      if (cancelled || seen) return;
      setShouldRender(true);

      const bounceLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, {
            toValue: -8,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounce, {
            toValue: 0,
            duration: 550,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      bounceLoop.start();

      const timer = setTimeout(() => {
        bounceLoop.stop();
        Animated.timing(translateY, {
          toValue: -screenHeight * 1.2,
          duration: EXIT_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          markIntroSeen();
          setShouldRender(false);
        });
      }, HOLD_MS);

      return () => clearTimeout(timer);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount by design; screenHeight/translateY are stable enough for a one-shot intro.
  }, []);

  if (!shouldRender) return null;

  const wordmarkWidth = Math.min(screenWidth * 0.58, 280);

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.overlay, { backgroundColor: CHARCOAL, transform: [{ translateY }] }]}
    >
      <View style={{ flex: 1 }} />
      <View style={{ alignItems: "center", gap: 12, paddingHorizontal: 40 }}>
        <Image
          source={require("../../assets/wordmark.png")}
          accessibilityLabel="Tally"
          style={{ width: wordmarkWidth, height: wordmarkWidth / WORDMARK_ASPECT_RATIO }}
          resizeMode="contain"
        />
        <ThemedText preset="body" style={{ color: CANVAS_CREAM, textAlign: "center" }}>
          For all of life&apos;s IOUs
        </ThemedText>
      </View>
      <View style={{ flex: 2, alignItems: "center", justifyContent: "flex-end", paddingBottom: insets.bottom + 24 }}>
        <Animated.View style={{ transform: [{ translateY: bounce }] }}>
          <Ionicons name="chevron-up" size={28} color={CANVAS_CREAM} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 999,
  },
});
