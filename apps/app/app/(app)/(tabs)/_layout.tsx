import { Ionicons } from "@expo/vector-icons";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import { Platform, Pressable, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BirdhouseIcon } from "@/components/BirdhouseIcon";
import { TallyMarkIcon } from "@/components/TallyMarkIcon";
import { useTheme } from "@/theme/ThemeProvider";

const PILL_WIDTH = 240;
const PILL_HEIGHT = 52;

// A fully custom tab bar instead of the default one: React Navigation's
// built-in tab bar reserves vertical space for a label even with
// tabBarShowLabel: false (a known quirk), which left icons sitting near the
// top of the pill instead of centered. Rendering our own Pressable per tab —
// just flex:1 + center, nothing else — sidesteps that entirely.
function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const pillStyle: StyleProp<ViewStyle> = {
    position: "absolute",
    left: (screenWidth - PILL_WIDTH) / 2,
    width: PILL_WIDTH,
    bottom: insets.bottom + 16,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    backgroundColor: colors.surface,
    flexDirection: "row",
    ...Platform.select({
      web: { boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  };

  return (
    <View style={pillStyle}>
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
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
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
