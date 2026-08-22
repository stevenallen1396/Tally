import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

export function PlaceholderAvatar({ size }: { size: number }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="person" size={size * 0.5} color={colors.textSecondary} />
    </View>
  );
}
