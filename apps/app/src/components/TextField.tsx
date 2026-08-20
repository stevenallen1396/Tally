import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import { ThemedText } from "./ThemedText";

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, style, ...rest }: TextFieldProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={{ gap: 6 }}>
      <ThemedText preset="label" color="secondary">
        {label}
      </ThemedText>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            fontFamily: typography.body.regular.fontFamily,
            fontSize: typography.body.regular.fontSize,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
});
