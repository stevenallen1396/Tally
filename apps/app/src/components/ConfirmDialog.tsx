import { Modal, Pressable, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import { Button } from "./Button";
import { ThemedText } from "./ThemedText";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// react-native-web has no Alert.alert UI (it's a native-only API), so
// confirmation prompts that also need to work on the deployed web build go
// through this Modal-based dialog instead.
export function ConfirmDialog({ visible, title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 20,
            gap: 16,
          }}
        >
          <View style={{ gap: 6 }}>
            <ThemedText preset="headingSection">{title}</ThemedText>
            <ThemedText preset="body" color="secondary">
              {message}
            </ThemedText>
          </View>
          <View style={{ gap: 10 }}>
            <Button label={confirmLabel} onPress={onConfirm} variant="secondary" />
            <Button label="Cancel" onPress={onCancel} variant="ghost" />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
