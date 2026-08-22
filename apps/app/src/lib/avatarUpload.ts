import { supabase } from "./supabase";

// Picked image URIs are blob:/content:/ph: URLs with no real file extension,
// so the storage path extension has to come from the asset's MIME type
// instead of parsing the URI.
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

function extensionFromMimeType(mimeType: string | null | undefined) {
  return MIME_TO_EXT[mimeType ?? ""] ?? "jpg";
}

export async function uploadAvatar(
  userId: string,
  imageUri: string,
  mimeType: string | null | undefined,
): Promise<string> {
  const arraybuffer = await fetch(imageUri).then((res) => res.arrayBuffer());
  const fileExt = extensionFromMimeType(mimeType);
  const path = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, arraybuffer, { contentType: mimeType ?? "image/jpeg", upsert: true });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${publicUrl}?t=${Date.now()}`;
}
