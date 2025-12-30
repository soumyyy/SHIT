import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/constants/theme";
import { formatTimeRange } from "@/data/helpers";
import { AttendanceStatus, Subject, TimetableSlot } from "@/data/models";

interface AttendanceModalProps {
  visible: boolean;
  slot: TimetableSlot | null;
  subject: Subject | undefined;
  onClose: () => void;
  onSubmit: (status: AttendanceStatus) => Promise<void>;
}

export const AttendanceModal = ({
  visible,
  slot,
  subject,
  onClose,
  onSubmit,
}: AttendanceModalProps) => {
  if (!visible || !slot || !subject) {
    return null;
  }

  const handleSelect = async (value: AttendanceStatus) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{subject.name}</Text>
          <Text style={styles.subtitle}>{formatTimeRange(slot.startTime, slot.durationMinutes)}</Text>
          {slot.room ? <Text style={styles.room}>{slot.room}</Text> : null}

          <View style={styles.selectorRow}>
            {(["present", "absent"] as AttendanceStatus[]).map((value) => (
              <Pressable
                key={value}
                style={styles.option}
                onPress={() => handleSelect(value)}
              >
                <Text style={styles.optionLabel}>{value.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  room: {
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  selectorRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: spacing.sm,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
});
