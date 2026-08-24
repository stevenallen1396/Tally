import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Share, View } from "react-native";

import { Button } from "@/components/Button";
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
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    await Clipboard.setStringAsync(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async () => {
    setError(null);
    setSubmitting(true);

    // New tallis start on the account's primary currency — changeable per-talli in Settings.
    const { data: tally, error: tallyError } = await supabase.rpc("create_tally_with_owner", {
      p_currency: profile?.primary_currency ?? "GBP",
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
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                label={copied ? "Copied!" : "Copy link"}
                variant="secondary"
                onPress={handleCopyLink}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Share link" onPress={() => Share.share({ message: inviteLink })} />
            </View>
          </View>
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
