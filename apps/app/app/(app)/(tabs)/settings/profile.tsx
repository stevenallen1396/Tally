import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { PlaceholderAvatar } from "@/components/PlaceholderAvatar";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useProfile } from "@/hooks/useProfile";
import { uploadAvatar } from "@/lib/avatarUpload";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const { session } = useSession();
  const { profile, refetch } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      .upsert({ id: session.user.id, display_name: displayName.trim() });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
  };

  const handlePickAvatar = async () => {
    if (!session) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;

    const image = result.assets[0];
    setError(null);
    setUploadingAvatar(true);
    try {
      const avatarUrl = await uploadAvatar(session.user.id, image.uri, image.mimeType);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", session.user.id);
      if (updateError) throw updateError;

      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't upload that photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Pressable onPress={handlePickAvatar} disabled={uploadingAvatar} style={{ alignItems: "center", gap: 8 }}>
          {profile?.avatar_url ? <Avatar uri={profile.avatar_url} size={72} /> : <PlaceholderAvatar size={72} />}
          <ThemedText preset="body" color="secondary" style={{ textDecorationLine: "underline" }}>
            {uploadingAvatar ? "Uploading…" : "Change photo"}
          </ThemedText>
        </Pressable>
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
