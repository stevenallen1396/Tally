import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  style?: ViewStyle;
}>;

export function Screen({ children, scroll = false, style }: ScreenProps) {
  const { colors } = useTheme();
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Container
        style={scroll ? undefined : [styles.body, style]}
        contentContainerStyle={scroll ? [styles.body, style] : undefined}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  body: {
    flex: 1,
    padding: 20,
  },
});
