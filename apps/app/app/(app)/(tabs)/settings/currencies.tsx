import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";

import { CurrencyPicker } from "@/components/CurrencyPicker";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useTallies } from "@/hooks/useTallies";
import { useTheme } from "@/theme/ThemeProvider";
import { supabase } from "@/lib/supabase";

export default function Tallies() {
  const { colors, typography } = useTheme();
  const { tallies, loading, refetch } = useTallies();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");

  const handleCurrencyChange = async (tallyId: string, currency: string) => {
    await supabase.rpc("set_tally_currency", { p_tally_id: tallyId, p_currency: currency });
    refetch();
  };

  const startEditingName = (tallyId: string, currentName: string) => {
    setNameDraft(currentName);
    setEditingId(tallyId);
  };

  const saveName = async (tallyId: string) => {
    setEditingId(null);
    await supabase.rpc("set_buddy_nickname", { p_tally_id: tallyId, p_nickname: nameDraft });
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
            {editingId === item.id ? (
              <TextInput
                value={nameDraft}
                onChangeText={setNameDraft}
                onBlur={() => saveName(item.id)}
                onSubmitEditing={() => saveName(item.id)}
                autoFocus
                selectTextOnFocus
                style={[typography.body.emphasis, { color: colors.textPrimary, padding: 0 }]}
              />
            ) : (
              <Pressable
                onPress={() => startEditingName(item.id, item.partnerName)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <ThemedText preset="bodyEmphasis">{item.partnerName}</ThemedText>
                <Ionicons name="pencil" size={13} color={colors.textSecondary} />
              </Pressable>
            )}
            <CurrencyPicker value={item.currency} onChange={(currency) => handleCurrencyChange(item.id, currency)} />
          </View>
        )}
      />
    </Screen>
  );
}
