import { IBMPlexMono_400Regular, IBMPlexMono_700Bold } from "@expo-google-fonts/ibm-plex-mono";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { IntroOverlay } from "@/components/IntroOverlay";
import { SessionProvider } from "@/lib/SessionProvider";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

function RootStack() {
  const { mode, colors } = useTheme();

  return (
    <>
      <Head>
        <title>Talli</title>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* apple-mobile-web-app-capable alone (no manifest scope) only kept
            the exact URL last "Added to Home Screen" chrome-less — every
            other route fell back to showing Safari's bar. The manifest's
            scope fixes that app-wide; the meta tags stay for older-iOS
            fallback. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Talli" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#2B2926" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="invite/[token]" options={{ presentation: "modal" }} />
      </Stack>
      <IntroOverlay />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_700Bold,
    Genty: require("../assets/fonts/Genty.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
