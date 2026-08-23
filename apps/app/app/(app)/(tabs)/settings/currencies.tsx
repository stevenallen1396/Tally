import { FlatList, View } from "react-native";

import { CurrencyPicker } from "@/components/CurrencyPicker";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useTallies } from "@/hooks/useTallies";
import { useTheme } from "@/theme/ThemeProvider";
import { supabase } from "@/lib/supabase";

export default function TallyCurrencies() {
  const { colors } = useTheme();
  const { tallies, loading, refetch } = useTallies();

  const handleChange = async (tallyId: string, currency: string) => {
    await supabase.rpc("set_tally_currency", { p_tally_id: tallyId, p_currency: currency });
    refetch();
  };

  return (
    <Screen style={{ padding: 0 }}>
      <FlatList
        data={tallies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 16 }}
        ListEmptyComponent={
          loading ? null : (
            <View style={{ paddingTop: 40, alignItems: "center" }}>
              <ThemedText preset="body" color="secondary">
                No tallis yet.
              </ThemedText>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View
            style={{
              gap: 10,
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <ThemedText preset="bodyEmphasis">{item.partnerName}</ThemedText>
            <CurrencyPicker value={item.currency} onChange={(currency) => handleChange(item.id, currency)} />
          </View>
        )}
      />
    </Screen>
  );
}
