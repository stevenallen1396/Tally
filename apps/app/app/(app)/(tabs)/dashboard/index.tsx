import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { FlatList, Pressable, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TallyCard } from "@/components/TallyCard";
import { ThemedText } from "@/components/ThemedText";
import { useTallies } from "@/hooks/useTallies";
import { useTheme } from "@/theme/ThemeProvider";

export default function Dashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { tallies, loading } = useTallies();

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 4 }}>
        <ThemedText preset="headingScreen">Your tallies</ThemedText>
      </View>
      <FlatList
        data={tallies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150, gap: 12 }}
        ListEmptyComponent={
          loading ? null : (
            <View style={{ paddingTop: 60, alignItems: "center", gap: 8 }}>
              <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
                No tallies yet. Start one with a friend to keep track of what you owe each other.
              </ThemedText>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TallyCard data={item} onPress={() => router.push(`/(app)/tally/${item.id}`)} />
        )}
      />
      <View style={{ position: "absolute", left: 20, right: 20, bottom: 84, gap: 12 }}>
        <View style={{ alignSelf: "center", alignItems: "center", gap: 6 }}>
          <Pressable
            onPress={() => router.push("/(app)/chat")}
            style={({ pressed }) => ({
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.accentTertiary,
              opacity: pressed ? 0.85 : 1,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            })}
          >
            <Ionicons name="sparkles" size={26} color="#FFFDF8" />
          </Pressable>
          <ThemedText preset="ledgerMeta" color="secondary">
            Ask Talli AI
          </ThemedText>
        </View>
        <Link href="/(app)/tally/new" asChild>
          <Button label="Start a tally" />
        </Link>
      </View>
    </Screen>
  );
}
