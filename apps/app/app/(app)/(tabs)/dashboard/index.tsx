import { Link, useRouter } from "expo-router";
import { FlatList, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TallyCard, type TallyCardData } from "@/components/TallyCard";
import { ThemedText } from "@/components/ThemedText";

// TODO(phase 2): replace with `useTallies()` — a hook reading `tallies` joined
// with `tally_members`/`profiles`/`entries`, live via Supabase Realtime.
const MOCK_TALLIES: TallyCardData[] = [
  { id: "1", partnerName: "Georgia", balanceMinor: 1250 },
  { id: "2", partnerName: "Sam", balanceMinor: -430 },
  { id: "3", partnerName: "Priya", balanceMinor: 0 },
];

export default function Dashboard() {
  const router = useRouter();

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 4 }}>
        <ThemedText preset="headingScreen">Your tallies</ThemedText>
      </View>
      <FlatList
        data={MOCK_TALLIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, gap: 12 }}
        ListEmptyComponent={
          <View style={{ paddingTop: 60, alignItems: "center", gap: 8 }}>
            <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
              No tallies yet. Start one with a friend to keep track of what you owe each other.
            </ThemedText>
          </View>
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
