import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "tally_has_seen_intro";

export async function hasSeenIntro(): Promise<boolean> {
  const value = Platform.OS === "web" ? localStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
  return value === "true";
}

export async function markIntroSeen(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(KEY, "true");
  } else {
    await SecureStore.setItemAsync(KEY, "true");
  }
}

export async function clearIntroSeen(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(KEY);
  } else {
    await SecureStore.deleteItemAsync(KEY);
  }
}
