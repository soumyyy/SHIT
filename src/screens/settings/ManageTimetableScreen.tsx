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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors, layout, radii, spacing, typography } from "@/constants/theme";
import { TimetableStackParamList } from "@/navigation/types";
import { useData } from "@/data/DataContext";
import { SubjectFormModal } from "@/components/SubjectFormModal";
import { Subject } from "@/data/models";

type Props = NativeStackScreenProps<TimetableStackParamList, "ManageTimetable">;

export const ManageTimetableScreen = ({ navigation }: Props) => {
    const { subjects, slots, importData, addSubject, updateSubject, deleteSubject } = useData();

    const [slotsJson, setSlotsJson] = useState("");
    const [subjectsJson, setSubjectsJson] = useState("");
    const [activeTab, setActiveTab] = useState<"subjects" | "slots">("subjects");
    const [subjectEditMode, setSubjectEditMode] = useState<"visual" | "json">("visual");
    const [subjectModalVisible, setSubjectModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    useEffect(() => {
        setSubjectsJson(JSON.stringify(subjects, null, 2));
        setSlotsJson(JSON.stringify(slots, null, 2));
    }, [subjects, slots]);

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



    const renderSubjectItem = ({ item }: { item: Subject }) => (
        <Pressable style={styles.subjectCard} onPress={() => handleEditSubject(item)}>
            <View style={styles.subjectCardHeader}>
                <View style={styles.subjectIdent}>
                    <Text style={styles.subjectId}>{item.id}</Text>
                    <Text style={styles.subjectNameCompact} numberOfLines={1}>
                        {item.name}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </View>
            {item.professor && (
                <Text style={styles.subjectProfessor} numberOfLines={1}>
                    {item.professor}
                </Text>
            )}
        </Pressable>
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
                            <View style={styles.editorContainer}>
                                <Text style={styles.hintText}>Edit subjects using JSON format.</Text>
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
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.editorContainer}>
                        <Text style={styles.hintText}>Edit timetable slots using JSON format.</Text>
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
                    </View>
                )}

                <View style={styles.footer}>
                    {(activeTab === "slots" || (activeTab === "subjects" && subjectEditMode === "json")) && (
                        <Pressable style={styles.saveButton} onPress={activeTab === "subjects" ? handleSaveSubjects : handleSaveSlots}>
                            <Text style={styles.saveButtonText}>
                                {activeTab === "subjects" ? "Save Subjects" : "Save Slots"}
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
});

