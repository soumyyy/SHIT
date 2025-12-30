import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { colors, radii, shadows, spacing, typography } from "@/constants/theme";
import { Subject, TimetableSlot } from "@/data/models";

interface SlotFormModalProps {
    visible: boolean;
    slot: TimetableSlot | null;
    subjects: Subject[];
    allSlots: TimetableSlot[];
    onClose: () => void;
    onSave: (slot: Omit<TimetableSlot, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const SlotFormModal = ({ visible, slot, subjects, allSlots, onClose, onSave, onDelete }: SlotFormModalProps) => {
    const isEditing = !!slot;

    const [subjectId, setSubjectId] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState(0);
    const [startTime, setStartTime] = useState("09:00");
    const [durationMinutes, setDurationMinutes] = useState("90");
    const [room, setRoom] = useState("");
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showSubjectPicker, setShowSubjectPicker] = useState(false);
    const [showDayPicker, setShowDayPicker] = useState(false);
    const [showDurationPicker, setShowDurationPicker] = useState(false);

    useEffect(() => {
        if (visible) {
            if (slot) {
                setSubjectId(slot.subjectId);
                setDayOfWeek(slot.dayOfWeek);
                setStartTime(slot.startTime);
                setDurationMinutes(slot.durationMinutes.toString());
                setRoom(slot.room);
            } else {
                setSubjectId(subjects[0]?.id || "");
                setDayOfWeek(0);
                setStartTime("09:00");
                setDurationMinutes("90");
                setRoom("");
            }
        }
    }, [visible, slot, subjects]);

    const handleSave = async () => {
        if (!subjectId || !room.trim()) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        const duration = parseInt(durationMinutes, 10);
        if (isNaN(duration) || duration <= 0) {
            Alert.alert("Invalid Duration", "Duration must be a positive number.");
            return;
        }

        // Check for time conflicts
        const [hours, minutes] = startTime.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;

        const hasConflict = allSlots.some(existingSlot => {
            // Skip checking against itself when editing
            if (slot && existingSlot.id === slot.id) return false;

            // Only check slots on the same day
            if (existingSlot.dayOfWeek !== dayOfWeek) return false;

            const [exHours, exMinutes] = existingSlot.startTime.split(":").map(Number);
            const exStartMinutes = exHours * 60 + exMinutes;
            const exEndMinutes = exStartMinutes + existingSlot.durationMinutes;

            // Check if times overlap
            return (startMinutes < exEndMinutes && endMinutes > exStartMinutes);
        });

        if (hasConflict) {
            const conflictingSlot = allSlots.find(existingSlot => {
                if (slot && existingSlot.id === slot.id) return false;
                if (existingSlot.dayOfWeek !== dayOfWeek) return false;
                const [exHours, exMinutes] = existingSlot.startTime.split(":").map(Number);
                const exStartMinutes = exHours * 60 + exMinutes;
                const exEndMinutes = exStartMinutes + existingSlot.durationMinutes;
                return (startMinutes < exEndMinutes && endMinutes > exStartMinutes);
            });

            const conflictSubject = subjects.find(s => s.id === conflictingSlot?.subjectId);
            Alert.alert(
                "Time Conflict",
                `This slot overlaps with ${conflictSubject?.name || "another lecture"} at ${conflictingSlot?.startTime}. Please choose a different time.`
            );
            return;
        }

        const slotData: Omit<TimetableSlot, "id" | "createdAt" | "updatedAt"> = {
            subjectId,
            dayOfWeek,
            startTime,
            durationMinutes: duration,
            room: room.trim(),
        };

        await onSave(slotData);
        onClose();
    };

    const handleDelete = () => {
        if (!slot || !onDelete) return;

        Alert.alert(
            "Delete Slot",
            "Are you sure you want to delete this timetable slot?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await onDelete(slot.id);
                        onClose();
                    },
                },
            ]
        );
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === "ios");
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, "0");
            const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
            setStartTime(`${hours}:${minutes}`);
        }
    };

    const getTimeDate = () => {
        const [hours, minutes] = startTime.split(":").map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.card}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.header}>
                                <Text style={styles.title}>{isEditing ? "Edit Slot" : "New Slot"}</Text>
                                {isEditing && onDelete && (
                                    <Pressable style={styles.deleteIconButton} onPress={handleDelete}>
                                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                    </Pressable>
                                )}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Subject</Text>
                                <Pressable style={styles.pickerButton} onPress={() => setShowSubjectPicker(true)}>
                                    <Text style={styles.pickerButtonText}>
                                        {subjects.find(s => s.id === subjectId)?.name || "Select Subject"}
                                    </Text>
                                </Pressable>
                                {showSubjectPicker && Platform.OS === "ios" && (
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={subjectId}
                                            onValueChange={(value) => {
                                                setSubjectId(value);
                                                setShowSubjectPicker(false);
                                            }}
                                            style={styles.picker}
                                            itemStyle={styles.pickerItem}
                                        >
                                            {subjects.map((subject) => (
                                                <Picker.Item key={subject.id} label={`${subject.id} - ${subject.name}`} value={subject.id} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                                {showSubjectPicker && Platform.OS !== "ios" && (
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={subjectId}
                                            onValueChange={setSubjectId}
                                            style={styles.picker}
                                        >
                                            {subjects.map((subject) => (
                                                <Picker.Item key={subject.id} label={`${subject.id} - ${subject.name}`} value={subject.id} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Day of Week</Text>
                                <Pressable style={styles.pickerButton} onPress={() => setShowDayPicker(true)}>
                                    <Text style={styles.pickerButtonText}>{DAYS[dayOfWeek]}</Text>
                                </Pressable>
                                {showDayPicker && Platform.OS === "ios" && (
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={dayOfWeek}
                                            onValueChange={(value) => {
                                                setDayOfWeek(value as number);
                                                setShowDayPicker(false);
                                            }}
                                            style={styles.picker}
                                            itemStyle={styles.pickerItem}
                                        >
                                            {DAYS.map((day, index) => (
                                                <Picker.Item key={index} label={day} value={index} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                                {showDayPicker && Platform.OS !== "ios" && (
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={dayOfWeek}
                                            onValueChange={(value) => setDayOfWeek(value as number)}
                                            style={styles.picker}
                                        >
                                            {DAYS.map((day, index) => (
                                                <Picker.Item key={index} label={day} value={index} />
                                            ))}
                                        </Picker>
                                    </View>
                                )}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Start Time</Text>
                                <Pressable style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                                    <Text style={styles.timeButtonText}>{startTime}</Text>
                                </Pressable>
                                {showTimePicker && (
                                    <DateTimePicker
                                        value={getTimeDate()}
                                        mode="time"
                                        is24Hour={false}
                                        display="default"
                                        onChange={handleTimeChange}
                                    />
                                )}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Duration</Text>
                                <Pressable style={styles.pickerButton} onPress={() => setShowDurationPicker(true)}>
                                    <Text style={styles.pickerButtonText}>
                                        {durationMinutes === "60" ? "1 hour" : durationMinutes === "120" ? "2 hours" : durationMinutes === "180" ? "3 hours" : "Select Duration"}
                                    </Text>
                                </Pressable>
                                {showDurationPicker && Platform.OS === "ios" && (
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={durationMinutes}
                                            onValueChange={(value) => {
                                                setDurationMinutes(value as string);
                                                setShowDurationPicker(false);
                                            }}
                                            style={styles.picker}
                                            itemStyle={styles.pickerItem}
                                        >
                                            <Picker.Item label="1 hour" value="60" />
                                            <Picker.Item label="2 hours" value="120" />
                                            <Picker.Item label="3 hours" value="180" />
                                        </Picker>
                                    </View>
                                )}
                                {showDurationPicker && Platform.OS !== "ios" && (
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={durationMinutes}
                                            onValueChange={(value) => setDurationMinutes(value as string)}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="1 hour" value="60" />
                                            <Picker.Item label="2 hours" value="120" />
                                            <Picker.Item label="3 hours" value="180" />
                                        </Picker>
                                    </View>
                                )}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Room</Text>
                                <TextInput
                                    style={styles.input}
                                    value={room}
                                    onChangeText={setRoom}
                                    placeholder="e.g. LH-1, Lab-2"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <View style={styles.buttonRow}>
                                <Pressable style={styles.primaryButton} onPress={handleSave}>
                                    <Text style={styles.primaryButtonText}>{isEditing ? "Save Changes" : "Create Slot"}</Text>
                                </Pressable>

                                <Pressable style={styles.cancelButton} onPress={onClose}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        maxWidth: 500,
        maxHeight: "80%",
    },
    card: {
        backgroundColor: colors.background,
        borderRadius: radii.lg,
        padding: spacing.sm,
        ...shadows.medium,
        maxHeight: "100%",
    },
    title: {
        fontSize: typography.heading,
        fontWeight: "800",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    deleteIconButton: {
        padding: spacing.xs,
        borderRadius: radii.sm,
        backgroundColor: colors.danger + "10",
    },
    section: {
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: typography.small,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 4,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.sm,
        fontSize: typography.body,
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pickerContainer: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
        minHeight: 44,
        justifyContent: "center",
    },
    picker: {
        color: colors.textPrimary,
        backgroundColor: colors.surface,
        marginHorizontal: -8,
    },
    pickerItem: {
        color: colors.textPrimary,
        fontSize: typography.body,
    },
    timeButton: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
    },
    timeButtonText: {
        fontSize: typography.body,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    pickerButton: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
    },
    pickerButtonText: {
        fontSize: typography.body,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: colors.accent,
        borderRadius: radii.md,
        padding: spacing.sm,
        alignItems: "center",
    },
    primaryButtonText: {
        color: colors.background,
        fontWeight: "700",
        fontSize: typography.body,
    },
    buttonRow: {
        flexDirection: "row",
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.sm,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontWeight: "600",
        fontSize: typography.body,
    },
});
