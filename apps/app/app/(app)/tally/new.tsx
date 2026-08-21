import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { useState } from "react";
import { Share, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";

export default function NewTally() {
  const { colors } = useTheme();
  const [partnerLabel, setPartnerLabel] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    setSubmitting(true);

    const { data: tally, error: tallyError } = await supabase.rpc("create_tally_with_owner");
    if (tallyError || !tally) {
      setSubmitting(false);
      setError(tallyError?.message ?? "Couldn't create the tally");
      return;
    }

    const { data: invite, error: inviteError } = await supabase.rpc("create_invite", {
      p_tally_id: tally.id,
      p_invitee_label: partnerLabel.trim(),
    });
    setSubmitting(false);

    if (inviteError || !invite) {
      setError(inviteError?.message ?? "Couldn't create the invite link");
      return;
    }

    setInviteLink(Linking.createURL(`/invite/${invite.token}`));
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerLeft: () => <SmartBackButton fallbackHref="/(app)/(tabs)/dashboard" />,
        }}
      />
      <View style={{ gap: 16 }}>
        <ThemedText preset="body" color="secondary">
          Who&apos;s this tally with? This is just a label for you until they join.
        </ThemedText>
        <TextField label="Buddy's name" value={partnerLabel} onChangeText={setPartnerLabel} />
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
        {inviteLink ? null : (
          <Button
            label={submitting ? "Creating…" : "Create tally & get invite link"}
            onPress={handleCreate}
            disabled={submitting || !partnerLabel.trim()}
          />
        )}
      </View>

      {inviteLink ? (
        <View
          style={{
            marginTop: 24,
            gap: 12,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <ThemedText preset="bodyEmphasis">Share this link with {partnerLabel || "them"}</ThemedText>
          <ThemedText preset="ledgerMeta" color="secondary">
            {inviteLink}
          </ThemedText>
          <Button label="Share link" onPress={() => Share.share({ message: inviteLink })} />
        </View>
      ) : null}
    </Screen>
  );
}
