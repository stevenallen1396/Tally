import { useState } from "react";
import { Share, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/ThemeProvider";

// TODO(phase 2/3): call the `create_tally_with_owner` RPC, then create a
// pending `invites` row and build the real https://tally.folio.app/invite/{token} link.
export default function NewTally() {
  const { colors } = useTheme();
  const [partnerLabel, setPartnerLabel] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleCreate = () => {
    setInviteLink(`https://tally.folio.app/invite/mock-token`);
  };

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <ThemedText preset="body" color="secondary">
          Who&apos;s this tally with? This is just a label for you until they join.
        </ThemedText>
        <TextField label="Partner's name" value={partnerLabel} onChangeText={setPartnerLabel} />
        {inviteLink ? null : (
          <Button label="Create tally & get invite link" onPress={handleCreate} />
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
