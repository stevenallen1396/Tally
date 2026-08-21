import { Image, StyleSheet } from "react-native";

export function Avatar({ uri, size }: { uri: string; size: number }) {
  return (
    <Image
      source={{ uri }}
      accessibilityLabel="Avatar"
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
  },
});
