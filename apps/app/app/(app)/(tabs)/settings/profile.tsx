import { useEffect, useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const { session } = useSession();
  const { profile } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seeding the editable field from freshly-loaded data.
    if (profile) setDisplayName(profile.display_name);
  }, [profile]);

  const handleSave = async () => {
    if (!session) return;
    setError(null);
    setSaved(false);
    setSubmitting(true);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", session.user.id);
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
  };

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
        {saved ? (
          <ThemedText preset="body" color="credit">
            Saved
          </ThemedText>
        ) : null}
        <Button
          label={submitting ? "Saving…" : "Save"}
          onPress={handleSave}
          disabled={submitting || !displayName.trim()}
        />
      </View>
    </Screen>
  );
}
