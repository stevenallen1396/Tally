import { useEffect, useState } from "react";
import { Animated, StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

type TextFieldProps = TextInputProps & {
  label: string;
};

export function TextField({ label, value, style, onFocus, onBlur, placeholder, ...rest }: TextFieldProps) {
  const { colors, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const hasValue = value != null && value !== "";
  const floated = focused || hasValue;

  const [anim] = useState(() => new Animated.Value(floated ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: floated ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [anim, floated]);

  const labelTop = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 7] });
  const labelFontSize = anim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });

  return (
    <View style={{ position: "relative" }}>
      <Animated.Text
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 14,
          top: labelTop,
          fontSize: labelFontSize,
          fontFamily: floated ? typography.label.default.fontFamily : typography.body.regular.fontFamily,
          color: focused ? colors.accentPrimary : colors.textSecondary,
          zIndex: 1,
        }}
      >
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        placeholder={floated ? placeholder : undefined}
        placeholderTextColor={colors.textSecondary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            borderColor: focused ? colors.accentPrimary : colors.border,
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
    paddingTop: 22,
    paddingBottom: 8,
    paddingHorizontal: 14,
    minHeight: 52,
  },
});
