import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Share, View } from "react-native";

import { Button } from "@/components/Button";
import { CurrencyPicker } from "@/components/CurrencyPicker";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";

export default function NewTally() {
  const { colors } = useTheme();
  const router = useRouter();
  const { profile } = useProfile();
  const [partnerLabel, setPartnerLabel] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seeding the picker from the account's default once it loads.
    if (profile?.primary_currency) setCurrency(profile.primary_currency);
  }, [profile]);

  const handleCreate = async () => {
    setError(null);
    setSubmitting(true);

    const { data: tally, error: tallyError } = await supabase.rpc("create_tally_with_owner", {
      p_currency: currency,
    });
    if (tallyError || !tally) {
      setSubmitting(false);
      setError(tallyError?.message ?? "Couldn't create the talli");
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
    setInviteCode(invite.invite_code);
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
          Who&apos;s this talli with? This is just a label for you until they join.
        </ThemedText>
        <TextField label="Buddy's name" value={partnerLabel} onChangeText={setPartnerLabel} />
        <ThemedText preset="body" color="secondary">
          Currency
        </ThemedText>
        <CurrencyPicker value={currency} onChange={setCurrency} />
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
        {inviteLink ? null : (
          <>
            <Button
              label={submitting ? "Creating…" : "Create talli & get invite link"}
              onPress={handleCreate}
              disabled={submitting || !partnerLabel.trim()}
            />
            <Pressable
              onPress={() => router.push("/(app)/tally/join")}
              style={{ paddingVertical: 4, alignItems: "center" }}
            >
              <ThemedText preset="body" color="secondary" style={{ textDecorationLine: "underline" }}>
                Have a code instead? Join a talli
              </ThemedText>
            </Pressable>
          </>
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
          {inviteCode ? (
            <View style={{ gap: 6, marginTop: 4 }}>
              <ThemedText preset="ledgerMeta" color="secondary">
                Or they can type in this code instead:
              </ThemedText>
              <ThemedText preset="headingSection" style={{ letterSpacing: 1 }}>
                {inviteCode.toUpperCase()}
              </ThemedText>
            </View>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}
