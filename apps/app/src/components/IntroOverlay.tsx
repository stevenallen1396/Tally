import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, Easing, Image, PanResponder, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { hasSeenIntro, markIntroSeen } from "@/lib/introStorage";

import { ThemedText } from "./ThemedText";

const WORDMARK_ASPECT_RATIO = 1146 / 667;
const CHARCOAL = "#1E1C19";
const CANVAS_CREAM = "#F4EEDF";
const EXIT_MS = 1000;
// A swipe past this distance (or a fast enough flick, regardless of distance)
// counts as "dismiss"; anything smaller snaps back to the resting position.
const DISMISS_DISTANCE = 60;
const DISMISS_VELOCITY = 0.35;

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

      Animated.loop(
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
      ).start();
    });

    return () => {
      cancelled = true;
      bounce.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on mount by design; bounce is a stable Animated.Value.
  }, []);

  const dismiss = () => {
    bounce.stopAnimation();
    Animated.timing(translateY, {
      toValue: -screenHeight * 1.2,
      duration: EXIT_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      markIntroSeen();
      setShouldRender(false);
    });
  };

  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, gesture) => {
        translateY.setValue(Math.min(0, gesture.dy));
      },
      onPanResponderRelease: (_evt, gesture) => {
        const movedEnough = Math.abs(gesture.dx) + Math.abs(gesture.dy);
        const isTap = movedEnough < 10;
        const isSwipeUp = gesture.dy < -DISMISS_DISTANCE || gesture.vy < -DISMISS_VELOCITY;
        if (isTap || isSwipeUp) {
          dismiss();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  );

  if (!shouldRender) return null;

  const wordmarkWidth = Math.min(screenWidth * 0.58, 280);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.overlay, { backgroundColor: CHARCOAL, transform: [{ translateY }] }]}
    >
      <View style={{ flex: 1 }} />
      <View style={{ alignItems: "center", gap: 12, paddingHorizontal: 40 }}>
        <Image
          source={require("../../assets/wordmark.png")}
          accessibilityLabel="Talli"
          style={{ width: wordmarkWidth, height: wordmarkWidth / WORDMARK_ASPECT_RATIO }}
          resizeMode="contain"
        />
        <ThemedText
          preset="body"
          style={{ color: CANVAS_CREAM, textAlign: "center", fontSize: 19, lineHeight: 28, marginTop: 8 }}
        >
          For all of life&apos;s IOUs
        </ThemedText>
      </View>
      <View style={{ flex: 2, alignItems: "center", justifyContent: "flex-end", paddingBottom: insets.bottom + 24 }}>
        <Animated.View style={{ transform: [{ translateY: bounce }, { scaleY: 0.6 }] }}>
          <Ionicons name="chevron-up" size={56} color={CANVAS_CREAM} />
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
