import { Ionicons } from "@expo/vector-icons";
import { type Href } from "expo-router";
import { Pressable } from "react-native";

import { goBackOrReplace } from "@/lib/navigation";
import { useTheme } from "@/theme/ThemeProvider";

/**
 * A back button that always works, regardless of how the screen was
 * reached — including a deep link or a `router.replace()` elsewhere that
 * left no navigation history (e.g. joining a tally via an invite link).
 * Falls back to `fallbackHref` when there's nothing to go back to.
 */
export function SmartBackButton({ fallbackHref }: { fallbackHref: Href }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => goBackOrReplace(fallbackHref)}
      hitSlop={12}
      style={{ paddingLeft: 8, paddingRight: 16, paddingVertical: 4 }}
    >
      <Ionicons name="chevron-back" size={26} color={colors.accentPrimary} />
    </Pressable>
  );
}
