import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radii, spacing, typography } from "@/constants/theme";
import { formatTimeRange } from "@/data/helpers";
import { AttendanceStatus, Subject, TimetableSlot } from "@/data/models";

interface AttendanceModalProps {
  visible: boolean;
  slot: TimetableSlot | null;
  subject: Subject | undefined;
  existingStatus?: AttendanceStatus;
  onClose: () => void;
  onSubmit: (status: AttendanceStatus) => Promise<void>;
  onEdit?: () => void;
}

export const AttendanceModal = ({
  visible,
  slot,
  subject,
  existingStatus,
  onClose,
  onSubmit,
  onEdit,
}: AttendanceModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>("present");

  // Use existing status if available, otherwise default to "present"
  useEffect(() => {
    if (visible) {
      setSelectedStatus(existingStatus ?? "present");
    }
  }, [visible, existingStatus]);

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
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{subject.name}</Text>
              <Text style={styles.subtitle}>{formatTimeRange(slot.startTime, slot.durationMinutes)}</Text>
              {slot.room ? <Text style={styles.room}>{slot.room}</Text> : null}
            </View>
            {onEdit && (
              <Pressable style={styles.editButton} onPress={onEdit}>
                <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          <View style={styles.selectorRow}>
            {(["present", "absent"] as AttendanceStatus[]).map((value) => {
              const isSelected = selectedStatus === value;
              return (
                <Pressable
                  key={value}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    setSelectedStatus(value);
                    handleSelect(value);
                  }}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {value.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
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
    // paddingBottom: 0,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
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
  optionSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  optionLabelSelected: {
    color: "#FFFFFF",
  },
});
