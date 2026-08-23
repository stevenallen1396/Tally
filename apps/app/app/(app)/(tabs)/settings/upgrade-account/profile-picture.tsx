import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { PlaceholderAvatar } from "@/components/PlaceholderAvatar";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { uploadAvatar } from "@/lib/avatarUpload";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";
import { useAccountSetupStore } from "@/stores/accountSetupStore";

type PickedImage = { uri: string; mimeType: string | null | undefined };

export default function UpgradeAccountProfilePicture() {
  const { session } = useSession();
  const email = useAccountSetupStore((state) => state.email);
  const password = useAccountSetupStore((state) => state.password);
  const displayName = useAccountSetupStore((state) => state.displayName);
  const reset = useAccountSetupStore((state) => state.reset);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [existingPassword, setExistingPassword] = useState("");

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    setPickedImage({ uri: result.assets[0].uri, mimeType: result.assets[0].mimeType });
  };

  const handleFinish = async () => {
    if (!session) return;
    setError(null);
    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser(
        { email, password },
        { emailRedirectTo: Linking.createURL("/") },
      );
      if (updateError) {
        if (updateError.code === "email_exists" || /already registered/i.test(updateError.message)) {
          setEmailTaken(true);
          return;
        }
        throw updateError;
      }

      const avatarUrl = pickedImage
        ? await uploadAvatar(session.user.id, pickedImage.uri, pickedImage.mimeType)
        : null;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: session.user.id,
        display_name: displayName,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      });
      if (profileError) throw profileError;

      reset();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong saving your account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignInAndMerge = async () => {
    if (!session) return;
    setError(null);
    setSubmitting(true);

    // Capture the guest session's token before signInWithPassword replaces
    // it, so any tallies started as this guest can be pulled across.
    const guestAccessToken = session.access_token;
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: existingPassword,
    });
    if (signInError) {
      setSubmitting(false);
      setError(signInError.message);
      return;
    }

    const { error: mergeError } = await supabase.functions.invoke("merge-guest-account", {
      body: { guest_access_token: guestAccessToken },
    });
    setSubmitting(false);
    if (mergeError) {
      setError("Signed in, but couldn't bring your guest talli across — try again from Settings.");
      return;
    }

    reset();
    router.replace("/(app)/(tabs)/dashboard");
  };

  if (emailTaken) {
    return (
      <Screen>
        <View style={{ gap: 16, marginTop: 12 }}>
          <ThemedText preset="body" color="secondary">
            {email} already has an account. Sign in to it and any tallies you started as a guest will
            move across.
          </ThemedText>
          <TextField
            label="Password"
            value={existingPassword}
            onChangeText={setExistingPassword}
            secureTextEntry
          />
          {error ? (
            <ThemedText preset="body" color="debit">
              {error}
            </ThemedText>
          ) : null}
          <Button
            label={submitting ? "Signing in…" : "Sign in & bring talli across"}
            onPress={handleSignInAndMerge}
            disabled={submitting || !existingPassword}
          />
        </View>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", gap: 8 }}>
          <ThemedText preset="headingScreen">Check your email</ThemedText>
          <ThemedText preset="body" color="secondary">
            Confirm the link we sent to {email} to finish saving your account.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 16, marginTop: 12, alignItems: "center" }}>
        <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
          Add a photo so your buddies recognize you — or skip it for now.
        </ThemedText>
        <Pressable onPress={handlePickPhoto} disabled={submitting} style={{ alignItems: "center", gap: 8 }}>
          {pickedImage ? <Avatar uri={pickedImage.uri} size={96} /> : <PlaceholderAvatar size={96} />}
          <ThemedText preset="body" color="secondary" style={{ textDecorationLine: "underline" }}>
            {pickedImage ? "Choose a different photo" : "Add photo"}
          </ThemedText>
        </Pressable>
        {error ? (
          <ThemedText preset="body" color="debit" style={{ textAlign: "center" }}>
            {error}
          </ThemedText>
        ) : null}
        <View style={{ width: "100%" }}>
          <Button
            label={submitting ? "Saving…" : pickedImage ? "Save account" : "Skip"}
            onPress={handleFinish}
            disabled={submitting}
          />
        </View>
      </View>
    </Screen>
  );
}
