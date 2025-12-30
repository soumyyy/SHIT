import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, spacing, typography } from "@/constants/theme";
import { formatTimeRange } from "@/data/helpers";
import { Subject, TimetableSlot } from "@/data/models";

interface EditSlotModalProps {
    visible: boolean;
    slot: TimetableSlot | null;
    subject: Subject | undefined;
    currentDate: string; // YYYY-MM-DD
    onClose: () => void;
    onCancel: () => Promise<void>;
    onModifyDuration: (newDuration: number) => Promise<void>;
    onChangeDate: (newDate: string, newTime: string) => Promise<void>;
}

const DURATION_OPTIONS = [60, 120, 180]; // 1hr, 2hr, 3hr in minutes

export const EditSlotModal = ({
    visible,
    slot,
    subject,
    currentDate,
    onClose,
    onCancel,
    onModifyDuration,
    onChangeDate,
}: EditSlotModalProps) => {
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    if (!visible || !slot || !subject) {
        return null;
    }

    const handleCancelLecture = async () => {
        await onCancel();
        onClose();
    };

    const handleModifyDuration = async () => {
        if (selectedDuration) {
            await onModifyDuration(selectedDuration);
            onClose();
        }
    };

    const handleChangeDate = async () => {
        if (newDate && newTime) {
            await onChangeDate(newDate, newTime);
            onClose();
        }
    };

    return (
        <Modal transparent visible animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.title}>Edit Lecture</Text>
                        <Text style={styles.subtitle}>{subject.name}</Text>
                        <Text style={styles.info}>
                            {formatTimeRange(slot.startTime, slot.durationMinutes)} • {currentDate}
                        </Text>

                        {/* Cancel Lecture */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cancel Lecture</Text>
                            <Pressable style={styles.dangerButton} onPress={handleCancelLecture}>
                                <Text style={styles.dangerButtonText}>Cancel this lecture</Text>
                            </Pressable>
                        </View>

                        {/* Modify Duration */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Modify Duration</Text>
                            <Text style={styles.sectionSubtitle}>
                                Current: {slot.durationMinutes} minutes
                            </Text>
                            <View style={styles.durationGrid}>
                                {DURATION_OPTIONS.map((duration) => (
                                    <Pressable
                                        key={duration}
                                        style={[
                                            styles.durationOption,
                                            selectedDuration === duration && styles.durationOptionSelected,
                                        ]}
                                        onPress={() => setSelectedDuration(duration)}
                                    >
                                        <Text
                                            style={[
                                                styles.durationText,
                                                selectedDuration === duration && styles.durationTextSelected,
                                            ]}
                                        >
                                            {duration / 60}hr
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                            {selectedDuration && (
                                <Pressable style={styles.primaryButton} onPress={handleModifyDuration}>
                                    <Text style={styles.primaryButtonText}>
                                        Update to {selectedDuration / 60} hour{selectedDuration > 60 ? 's' : ''}
                                    </Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Change Date */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Reschedule</Text>
                            <Text style={styles.sectionSubtitle}>Enter new date (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                value={newDate}
                                onChangeText={setNewDate}
                                placeholder="2026-01-15"
                                placeholderTextColor={colors.textMuted}
                            />
                            <Text style={styles.sectionSubtitle}>Enter new time (HH:MM)</Text>
                            <TextInput
                                style={styles.input}
                                value={newTime}
                                onChangeText={setNewTime}
                                placeholder="09:00"
                                placeholderTextColor={colors.textMuted}
                            />
                            {newDate && newTime && (
                                <Pressable style={styles.primaryButton} onPress={handleChangeDate}>
                                    <Text style={styles.primaryButtonText}>Reschedule to {newDate} at {newTime}</Text>
                                </Pressable>
                            )}
                        </View>

                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </Pressable>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    card: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radii.xl,
        borderTopRightRadius: radii.xl,
        padding: spacing.lg,
        maxHeight: "90%",
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    title: {
        color: colors.textPrimary,
        fontSize: typography.heading,
        fontWeight: "700",
        marginBottom: spacing.xs,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: typography.body,
        marginBottom: spacing.xs,
    },
    info: {
        color: colors.textMuted,
        fontSize: typography.small,
        marginBottom: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: typography.body,
        fontWeight: "700",
        marginBottom: spacing.xs,
    },
    sectionSubtitle: {
        color: colors.textSecondary,
        fontSize: typography.small,
        marginBottom: spacing.sm,
    },
    durationGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    durationOption: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.card,
    },
    durationOptionSelected: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    durationText: {
        color: colors.textPrimary,
        fontSize: typography.small,
        fontWeight: "600",
    },
    durationTextSelected: {
        color: colors.background,
    },
    input: {
        backgroundColor: colors.card,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        padding: spacing.md,
        color: colors.textPrimary,
        fontSize: typography.body,
        marginBottom: spacing.sm,
    },
    primaryButton: {
        backgroundColor: colors.accent,
        borderRadius: radii.md,
        padding: spacing.md,
        alignItems: "center",
    },
    primaryButtonText: {
        color: colors.background,
        fontSize: typography.body,
        fontWeight: "700",
    },
    dangerButton: {
        backgroundColor: colors.danger + "15",
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.danger,
        padding: spacing.md,
        alignItems: "center",
    },
    dangerButtonText: {
        color: colors.danger,
        fontSize: typography.body,
        fontWeight: "700",
    },
    closeButton: {
        backgroundColor: colors.glass,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        padding: spacing.md,
        alignItems: "center",
        marginTop: spacing.md,
    },
    closeButtonText: {
        color: colors.textSecondary,
        fontSize: typography.body,
        fontWeight: "600",
    },
});
