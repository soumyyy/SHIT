import { useState, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    Pressable,
    Alert,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { colors, layout, radii, spacing, typography } from "@/constants/theme";
import { TimetableStackParamList } from "@/navigation/types";
import { useData } from "@/data/DataContext";
import { SubjectFormModal } from "@/components/SubjectFormModal";
import { SlotFormModal } from "@/components/SlotFormModal";
import { EditableSubjectRow } from "@/components/EditableSubjectRow";
import { SlotRow } from "@/components/SlotRow";
import { Subject, TimetableSlot } from "@/data/models";
import { STORAGE_KEYS } from "@/storage/keys";
import { useSubjectMap } from "@/hooks/useSubjectMap";

type Props = NativeStackScreenProps<TimetableStackParamList, "ManageTimetable">;

export const ManageTimetableScreen = ({ navigation }: Props) => {
    const { subjects, slots, importData, addSubject, updateSubject, deleteSubject, updateSlot, deleteSlot, attendanceLogs, slotOverrides, settings, refresh } = useData();
    const subjectsById = useSubjectMap(subjects);

    const [slotsJson, setSlotsJson] = useState("");
    const [subjectsJson, setSubjectsJson] = useState("");
    const [attendanceJson, setAttendanceJson] = useState("");
    const [activeTab, setActiveTab] = useState<"subjects" | "slots" | "attendance">("subjects");
    const [subjectEditMode, setSubjectEditMode] = useState<"visual" | "json">("visual");
    const [slotEditMode, setSlotEditMode] = useState<"visual" | "json">("visual");
    const [attendanceEditable, setAttendanceEditable] = useState(false);
    const [lastTapTime, setLastTapTime] = useState(0);
    const [subjectModalVisible, setSubjectModalVisible] = useState(false);
    const [slotModalVisible, setSlotModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

    useEffect(() => {
        setSubjectsJson(JSON.stringify(subjects, null, 2));
        setSlotsJson(JSON.stringify(slots, null, 2));
        setAttendanceJson(JSON.stringify(attendanceLogs, null, 2));
    }, [subjects, slots, attendanceLogs]);

    const handleSaveSlots = async () => {
        try {
            const parsedSlots = JSON.parse(slotsJson);
            if (!Array.isArray(parsedSlots)) {
                throw new Error("Start with a list: [ ... ]");
            }
            await importData(subjects, parsedSlots);
            Alert.alert("Success", "Timetable slots updated!");
        } catch (error) {
            Alert.alert("Invalid JSON", (error as Error).message);
        }
    };

    const handleSaveSubjects = async () => {
        try {
            const parsedSubjects = JSON.parse(subjectsJson);
            if (!Array.isArray(parsedSubjects)) {
                throw new Error("Start with a list: [ ... ]");
            }
            await importData(parsedSubjects, slots);
            Alert.alert("Success", "Subjects updated!");
            setSubjectEditMode("visual");
        } catch (error) {
            Alert.alert("Invalid JSON", (error as Error).message);
        }
    };

    const handleSaveAttendance = async () => {
        try {
            console.log("Parsing attendance JSON...");
            const parsedAttendance = JSON.parse(attendanceJson);
            if (!Array.isArray(parsedAttendance)) {
                throw new Error("Attendance logs must be an array: [ ... ]");
            }
            console.log("Parsed attendance:", parsedAttendance.length, "logs");
            // Directly save attendance logs to storage
            await AsyncStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(parsedAttendance));
            console.log("Saved to AsyncStorage");
            // Reload data from storage to update UI immediately
            await refresh();
            console.log("Refreshed data");
            Alert.alert("Success", "Attendance logs updated!");
            setAttendanceEditable(false);
        } catch (error) {
            console.error("Error saving attendance:", error);
            Alert.alert("Invalid JSON", (error as Error).message);
        }
    };

    const handleAttendanceTap = () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTapTime < DOUBLE_TAP_DELAY) {
            setAttendanceEditable(true);
            Alert.alert("Edit Mode", "Attendance JSON is now editable. Be careful!");
        } else {
            setActiveTab("attendance");
        }
        setLastTapTime(now);
    };

    const handleAddSubject = () => {
        setEditingSubject(null);
        setSubjectModalVisible(true);
    };

    const handleEditSubject = (subject: Subject) => {
        setEditingSubject(subject);
        setSubjectModalVisible(true);
    };

    const handleSaveSubject = async (subject: Subject) => {
        try {
            if (editingSubject) {
                await updateSubject(subject);
            } else {
                await addSubject(subject);
            }
        } catch (error) {
            Alert.alert("Error", (error as Error).message);
        }
    };

    const handleExportData = async () => {
        try {
            const exportData = {
                subjects,
                slots,
                attendanceLogs,
                slotOverrides,
                settings,
                exportedAt: new Date().toISOString(),
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const fileName = `attendance-backup-${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, jsonString);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Save Attendance Data',
                    UTI: 'public.json',
                });
                Alert.alert("Success", "Data exported successfully!");
            } else {
                Alert.alert("Error", "Sharing is not available on this device");
            }
        } catch (error) {
            Alert.alert("Export Failed", (error as Error).message);
        }
    };

    const handleAddSlot = () => {
        setEditingSlot(null);
        setSlotModalVisible(true);
    };

    const handleEditSlot = (slot: TimetableSlot) => {
        setEditingSlot(slot);
        setSlotModalVisible(true);
    };

    const handleSaveSlot = async (slotData: Omit<TimetableSlot, "id" | "createdAt" | "updatedAt">) => {
        try {
            if (editingSlot) {
                const updatedSlot: TimetableSlot = {
                    ...editingSlot,
                    ...slotData,
                    updatedAt: new Date().toISOString(),
                };
                await updateSlot(updatedSlot);
            } else {
                const newSlot = {
                    ...slotData,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                await importData(subjects, [...slots, newSlot]);
            }
        } catch (error) {
            Alert.alert("Error", (error as Error).message);
        }
    };



    const renderSubjectItem = ({ item }: { item: Subject }) => (
        <EditableSubjectRow
            id={item.id}
            name={item.name}
            professor={item.professor}
            onPress={() => handleEditSubject(item)}
        />
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                <View style={styles.header}>
                    <View style={styles.tabs}>
                        <Pressable
                            style={[styles.tab, activeTab === "subjects" && styles.activeTab]}
                            onPress={() => setActiveTab("subjects")}
                        >
                            <Text style={[styles.tabText, activeTab === "subjects" && styles.activeTabText]}>Subjects</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === "slots" && styles.activeTab]}
                            onPress={() => setActiveTab("slots")}
                        >
                            <Text style={[styles.tabText, activeTab === "slots" && styles.activeTabText]}>Timetable Slots</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === "attendance" && styles.activeTab]}
                            onPress={handleAttendanceTap}
                        >
                            <Text style={[styles.tabText, activeTab === "attendance" && styles.activeTabText]}>
                                Attendance{attendanceEditable && " 🔓"}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {activeTab === "subjects" ? (
                    <View style={styles.container}>
                        <View style={styles.subjectsHeader}>
                            <Text style={styles.countText}>{subjects.length} Subjects</Text>
                            <View style={styles.subjectsHeaderActions}>
                                <Pressable
                                    style={[styles.miniButton, subjectEditMode === "json" && styles.miniButtonActive]}
                                    onPress={() => setSubjectEditMode(m => m === "visual" ? "json" : "visual")}
                                >
                                    <Ionicons name="code-slash" size={16} color={subjectEditMode === "json" ? colors.background : colors.textSecondary} />
                                </Pressable>
                                <Pressable style={styles.miniButton} onPress={handleExportData}>
                                    <Ionicons name="download-outline" size={16} color={colors.textSecondary} />
                                </Pressable>
                                <Pressable style={styles.addButton} onPress={handleAddSubject}>
                                    <Ionicons name="add" size={20} color={colors.background} />
                                    <Text style={styles.addButtonText}>Add Subject</Text>
                                </Pressable>
                            </View>
                        </View>

                        {subjectEditMode === "visual" ? (
                            <FlatList
                                data={subjects}
                                keyExtractor={(item) => item.id}
                                renderItem={renderSubjectItem}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>No subjects yet.</Text>
                                    </View>
                                }
                            />
                        ) : (
                            <ScrollView
                                style={styles.editorContainer}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Pressable onPress={Keyboard.dismiss}>
                                    <Text style={styles.hintText}>Edit subjects using JSON format.</Text>
                                </Pressable>
                                <TextInput
                                    style={styles.input}
                                    multiline
                                    value={subjectsJson}
                                    onChangeText={setSubjectsJson}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholder="Paste Subjects JSON here..."
                                    placeholderTextColor={colors.textMuted}
                                />
                            </ScrollView>
                        )}
                    </View>
                ) : activeTab === "attendance" ? (
                    <View style={styles.container}>
                        <View style={styles.subjectsHeader}>
                            <Text style={styles.countText}>{attendanceLogs.length} Attendance Logs</Text>
                        </View>
                        <ScrollView
                            style={styles.editorContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            <Pressable onPress={Keyboard.dismiss}>
                                <Text style={styles.hintText}>Attendance logs (read-only)</Text>
                            </Pressable>
                            <TextInput
                                style={styles.input}
                                multiline
                                value={attendanceJson}
                                onChangeText={setAttendanceJson}
                                editable={attendanceEditable}
                                autoCapitalize="none"
                                autoCorrect={false}
                                placeholderTextColor={colors.textMuted}
                            />
                        </ScrollView>
                    </View>
                ) : (
                    <View style={styles.container}>
                        <View style={styles.subjectsHeader}>
                            <Text style={styles.countText}>{slots.length} Slots</Text>
                            <View style={styles.subjectsHeaderActions}>
                                <Pressable
                                    style={[styles.miniButton, slotEditMode === "json" && styles.miniButtonActive]}
                                    onPress={() => setSlotEditMode(m => m === "visual" ? "json" : "visual")}
                                >
                                    <Ionicons name="code-slash" size={16} color={slotEditMode === "json" ? colors.background : colors.textSecondary} />
                                </Pressable>
                                <Pressable style={styles.addButton} onPress={handleAddSlot}>
                                    <Ionicons name="add" size={20} color={colors.background} />
                                    <Text style={styles.addButtonText}>Add Slot</Text>
                                </Pressable>
                            </View>
                        </View>

                        {slotEditMode === "visual" ? (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayName, dayIndex) => {
                                    const daySlots = slots
                                        .filter(slot => slot.dayOfWeek === dayIndex)
                                        .sort((a, b) => a.startTime.localeCompare(b.startTime));

                                    if (daySlots.length === 0) return null;

                                    return (
                                        <View key={dayIndex} style={styles.daySection}>
                                            <View style={styles.daySectionHeader}>
                                                <Text style={styles.daySectionTitle}>{dayName}</Text>
                                                <Text style={styles.daySectionCount}>({daySlots.length})</Text>
                                            </View>
                                            {daySlots.map(slot => {
                                                const subject = subjectsById[slot.subjectId];
                                                if (!subject) return null;
                                                return (
                                                    <SlotRow
                                                        key={slot.id}
                                                        slot={slot}
                                                        subject={subject}
                                                        onPress={() => handleEditSlot(slot)}
                                                    />
                                                );
                                            })}
                                        </View>
                                    );
                                })}
                                {slots.length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>No slots yet.</Text>
                                    </View>
                                )}
                            </ScrollView>
                        ) : (
                            <ScrollView
                                style={styles.editorContainer}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Pressable onPress={Keyboard.dismiss}>
                                    <Text style={styles.hintText}>Edit timetable slots using JSON format.</Text>
                                </Pressable>
                                <TextInput
                                    style={styles.input}
                                    multiline
                                    value={slotsJson}
                                    onChangeText={setSlotsJson}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    placeholder="Paste Slots JSON here..."
                                    placeholderTextColor={colors.textMuted}
                                />
                            </ScrollView>
                        )}
                    </View>
                )}

                <View style={styles.footer}>
                    {((activeTab === "slots" && slotEditMode === "json") || (activeTab === "subjects" && subjectEditMode === "json") || (activeTab === "attendance" && attendanceEditable)) && (
                        <Pressable
                            style={styles.saveButton}
                            onPress={activeTab === "subjects" ? handleSaveSubjects : activeTab === "attendance" ? handleSaveAttendance : handleSaveSlots}
                        >
                            <Text style={styles.saveButtonText}>
                                {activeTab === "subjects" ? "Save Subjects" : activeTab === "attendance" ? "Save Attendance" : "Save Slots"}
                            </Text>
                        </Pressable>
                    )}
                </View>
            </KeyboardAvoidingView>

            <SubjectFormModal
                visible={subjectModalVisible}
                subject={editingSubject}
                onClose={() => setSubjectModalVisible(false)}
                onSave={handleSaveSubject}
                onDelete={deleteSubject}
            />

            <SlotFormModal
                visible={slotModalVisible}
                slot={editingSlot}
                subjects={subjects}
                allSlots={slots}
                onClose={() => setSlotModalVisible(false)}
                onSave={handleSaveSlot}
                onDelete={deleteSlot}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: layout.screenPadding,
    },
    header: {
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    tabs: {
        flexDirection: "row",
        backgroundColor: colors.surface,
        padding: 2,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: "center",
        borderRadius: radii.sm,
    },
    activeTab: {
        backgroundColor: colors.background,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tabText: {
        fontSize: typography.small,
        fontWeight: "600",
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.textPrimary,
        fontWeight: "700",
    },
    subjectsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    countText: {
        fontSize: typography.small,
        color: colors.textSecondary,
        fontWeight: "600",
    },
    addButton: {
        backgroundColor: colors.accent,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.md,
        gap: spacing.xs,
    },
    addButtonText: {
        color: colors.background,
        fontWeight: "700",
        fontSize: typography.small,
    },
    subjectsHeaderActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    miniButton: {
        width: 36,
        height: 36,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    miniButtonActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    listContent: {
        paddingBottom: spacing.xl,
    },
    subjectCard: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
    },
    subjectCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    subjectIdent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    subjectId: {
        fontSize: typography.small,
        fontWeight: "800",
        color: colors.accent,
        minWidth: 45,
    },
    subjectNameCompact: {
        flex: 1,
        fontSize: typography.small,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    subjectProfessor: {
        fontSize: typography.tiny,
        color: colors.textMuted,
        marginLeft: 53, // 45 (minWidth) + 8 (gap)
        marginTop: -2,
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: "center",
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: typography.body,
    },
    editorContainer: {
        flex: 1,
        paddingHorizontal: layout.screenPadding,
    },
    hintText: {
        fontSize: typography.tiny,
        color: colors.textMuted,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    input: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.md,
        fontSize: 12,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
        textAlignVertical: "top",
    },
    footer: {
        paddingVertical: spacing.md,
        paddingHorizontal: layout.screenPadding,
        paddingBottom: 80, // Extra padding to appear above tab bar
        flexDirection: "row",
        gap: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    saveButton: {
        flex: 2,
        backgroundColor: colors.accent,
        borderRadius: radii.md,
        padding: spacing.md,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonText: {
        color: colors.background,
        fontWeight: "700",
        fontSize: typography.body,
    },
    daySection: {
        marginBottom: spacing.lg,
    },
    daySectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    daySectionTitle: {
        fontSize: typography.subheading,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    daySectionCount: {
        fontSize: typography.small,
        fontWeight: "600",
        color: colors.textMuted,
    },
});

