import { Pressable, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import { ThemedText } from "./ThemedText";

export function SettingsRow({ label, onPress }: { label: string; onPress?: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <ThemedText preset="body">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});
