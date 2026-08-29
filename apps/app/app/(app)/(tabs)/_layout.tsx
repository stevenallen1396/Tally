import { Ionicons } from "@expo/vector-icons";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BirdhouseIcon } from "@/components/BirdhouseIcon";
import { TallyMarkIcon } from "@/components/TallyMarkIcon";
import { fontFamilies } from "@/theme/typography";
import { useTheme } from "@/theme/ThemeProvider";

const BAR_WIDTH = 240;

// A fully custom tab bar instead of the default one: React Navigation's
// built-in tab bar reserves vertical space for a label even with
// tabBarShowLabel: false (a known quirk), which left icons sitting near the
// top of the pill instead of centered. Rendering our own Pressable per tab —
// just flex:1 + center, nothing else — sidesteps that entirely.
function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const barStyle: StyleProp<ViewStyle> = {
    position: "absolute",
    left: (screenWidth - BAR_WIDTH) / 2,
    width: BAR_WIDTH,
    bottom: insets.bottom + 16,
    flexDirection: "row",
  };

  return (
    <View style={barStyle}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? colors.accentPrimary : colors.textSecondary;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.title}
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 4 }}
          >
            {/* Fixed 24x24 box around every icon — Ionicons (a font glyph)
                and the custom SVG icons have different internal vertical
                metrics at the same size prop, which threw off the visual
                gap to the label below. Forcing an identical centered box
                makes that gap consistent across all three tabs. */}
            <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
              {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
            </View>
            <Text
              style={{
                fontFamily: fontFamilies.ibmPlexMonoRegular,
                fontSize: 10,
                letterSpacing: 0.5,
                color,
              }}
            >
              {options.title?.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <BirdhouseIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => <TallyMarkIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
