import { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

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
    onChangeDate: (newDate: string, newTime: string) => Promise<void>;
}

// const DURATION_OPTIONS = [60, 120, 180]; // 1hr, 2hr, 3hr in minutes

export const EditSlotModal = ({
    visible,
    slot,
    subject,
    currentDate,
    onClose,
    onCancel,
    onChangeDate,
}: EditSlotModalProps) => {
    const [rescheduleDate, setRescheduleDate] = useState(new Date());
    const [rescheduleTime, setRescheduleTime] = useState(new Date());

    // For Android, we need to control visibility. For iOS 14+, 'default' display shows a button.
    // simpler to just always show the pickers inline on iOS, or manage visibility for both.
    // Let's go with managing visibility for better control.
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    if (!visible || !slot || !subject) {
        return null;
    }

    const handleCancelLecture = async () => {
        await onCancel();
        onClose();
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        const currentDate = selectedDate || rescheduleDate;
        setShowDatePicker(Platform.OS === 'ios');
        setRescheduleDate(currentDate);
    };

    const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (event.type === 'dismissed') return;

        const currentTime = selectedTime || rescheduleTime;
        currentTime.setMinutes(0, 0, 0); // Enforce hourly interval
        setRescheduleTime(currentTime);
    };

    const handleChangeDate = async () => {
        // Format YYYY-MM-DD
        const dateStr = rescheduleDate.toISOString().split('T')[0];

        // Format HH:MM
        const hours = rescheduleTime.getHours().toString().padStart(2, '0');
        const minutes = rescheduleTime.getMinutes().toString().padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        await onChangeDate(dateStr, timeStr);
        onClose();
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

                        {/* Change Date */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Reschedule</Text>

                            <View style={styles.pickerGroup}>
                                <View style={styles.pickerWrapper}>
                                    <Text style={styles.pickerLabel}>Date</Text>
                                    {Platform.OS === 'android' ? (
                                        <Pressable
                                            style={styles.androidPickerButton}
                                            onPress={() => setShowDatePicker(true)}
                                        >
                                            <Text style={styles.androidPickerText}>
                                                {rescheduleDate.toLocaleDateString()}
                                            </Text>
                                        </Pressable>
                                    ) : (
                                        <DateTimePicker
                                            testID="dateTimePicker"
                                            value={rescheduleDate}
                                            mode="date"
                                            display="compact"
                                            onChange={onDateChange}
                                            style={styles.iosPicker}
                                            themeVariant="light"
                                        />
                                    )}
                                </View>

                                <View style={styles.pickerWrapper}>
                                    <Text style={styles.pickerLabel}>Time</Text>
                                    {Platform.OS === 'android' ? (
                                        <Pressable
                                            style={styles.androidPickerButton}
                                            onPress={() => setShowTimePicker(true)}
                                        >
                                            <Text style={styles.androidPickerText}>
                                                {rescheduleTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </Pressable>
                                    ) : (
                                        <DateTimePicker
                                            testID="timePicker"
                                            value={rescheduleTime}
                                            mode="time"
                                            display="compact"
                                            onChange={onTimeChange}
                                            style={styles.iosPicker}
                                            themeVariant="light"
                                        />
                                    )}
                                </View>
                            </View>

                            {/* Android Pickers (Hidden/Floating) */}
                            {Platform.OS === 'android' && showDatePicker && (
                                <DateTimePicker
                                    value={rescheduleDate}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                />
                            )}
                            {Platform.OS === 'android' && showTimePicker && (
                                <DateTimePicker
                                    value={rescheduleTime}
                                    mode="time"
                                    display="default"
                                    onChange={onTimeChange}
                                />
                            )}

                            <Pressable style={styles.primaryButton} onPress={handleChangeDate}>
                                <Text style={styles.primaryButtonText}>Confirm Reschedule</Text>
                            </Pressable>
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
        marginTop: spacing.sm,
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
        marginTop: spacing.md,
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
    pickerGroup: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    pickerWrapper: {
        flex: 1,
    },
    pickerLabel: {
        color: colors.textSecondary,
        fontSize: typography.small,
        marginBottom: spacing.xs,
        fontWeight: "600",
    },
    androidPickerButton: {
        backgroundColor: colors.card,
        padding: spacing.md,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        width: '100%',
    },
    androidPickerText: {
        color: colors.textPrimary,
        fontSize: typography.body,
    },
    iosPicker: {
        height: 48,
        width: '100%',
        backgroundColor: colors.glass,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        marginRight: -10, // Adjust for iOS internal padding
    },
    // picker style removed as it is replaced by iosPicker
});
