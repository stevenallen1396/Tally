import { Link, useRouter } from "expo-router";
import { FlatList, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TallyCard } from "@/components/TallyCard";
import { ThemedText } from "@/components/ThemedText";
import { useTallies } from "@/hooks/useTallies";

export default function Dashboard() {
  const router = useRouter();
  const { tallies, loading } = useTallies();

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 4 }}>
        <ThemedText preset="headingScreen">Your tallies</ThemedText>
      </View>
      <FlatList
        data={tallies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}
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
      <View style={{ position: "absolute", left: 20, right: 20, bottom: 20 }}>
        <Link href="/(app)/tally/new" asChild>
          <Button label="Start a tally" />
        </Link>
      </View>
    </Screen>
  );
}
