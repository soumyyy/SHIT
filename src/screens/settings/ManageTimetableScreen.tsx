import { useState, useEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View, TextInput, ScrollView, Pressable, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { colors, layout, radii, spacing, typography } from "@/constants/theme";
import { TimetableStackParamList } from "@/navigation/types";
import { useData } from "@/data/DataContext";
import { mockSubjects, mockSlots, mockAttendanceLogs } from "@/data/mockData";

type Props = NativeStackScreenProps<TimetableStackParamList, "ManageTimetable">;

export const ManageTimetableScreen = ({ navigation }: Props) => {
    const { subjects, slots, importData } = useData();

    const [subjectsJson, setSubjectsJson] = useState("");
    const [slotsJson, setSlotsJson] = useState("");
    const [activeTab, setActiveTab] = useState<'subjects' | 'slots'>('subjects');

    useEffect(() => {
        // Pre-fill with current data formatted nicely
        setSubjectsJson(JSON.stringify(subjects, null, 2));
        setSlotsJson(JSON.stringify(slots, null, 2));
    }, [subjects, slots]);

    const handleSave = async () => {
        try {
            const parsedSubjects = JSON.parse(subjectsJson);
            const parsedSlots = JSON.parse(slotsJson);

            if (!Array.isArray(parsedSubjects) || !Array.isArray(parsedSlots)) {
                throw new Error("Start with a list: [ ... ]");
            }

            await importData(parsedSubjects, parsedSlots);
            Alert.alert("Success", "Timetable updated successfully!");
        } catch (error) {
            Alert.alert("Invalid JSON", (error as Error).message);
        }
    };

    const handleReset = () => {
        Alert.alert(
            "Reset Data",
            "This will replace your current timetable with the demo data. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        // We can manually reset by importing mock data
                        await importData(mockSubjects, mockSlots);
                        Alert.alert("Reset Complete");
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <View style={styles.tabs}>
                        <Pressable
                            style={[styles.tab, activeTab === 'subjects' && styles.activeTab]}
                            onPress={() => setActiveTab('subjects')}
                        >
                            <Text style={[styles.tabText, activeTab === 'subjects' && styles.activeTabText]}>Subjects</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === 'slots' && styles.activeTab]}
                            onPress={() => setActiveTab('slots')}
                        >
                            <Text style={[styles.tabText, activeTab === 'slots' && styles.activeTabText]}>Timetable Slots</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={styles.editorContainer}>
                    <TextInput
                        style={styles.input}
                        multiline
                        value={activeTab === 'subjects' ? subjectsJson : slotsJson}
                        onChangeText={activeTab === 'subjects' ? setSubjectsJson : setSlotsJson}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Paste JSON here..."
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                <View style={styles.footer}>
                    <Pressable style={styles.resetButton} onPress={handleReset}>
                        <Text style={styles.resetButtonText}>Reset to Default</Text>
                    </Pressable>
                    <Pressable style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
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
    header: {
        paddingHorizontal: layout.screenPadding,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        padding: 2,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: radii.sm,
    },
    activeTab: {
        backgroundColor: colors.background, // Or a highlight color
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
    editorContainer: {
        flex: 1,
        paddingHorizontal: layout.screenPadding,
    },
    input: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: spacing.md,
        fontSize: 12, // Monospace-ish size
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.border,
        textAlignVertical: 'top',
    },
    footer: {
        padding: layout.screenPadding,
        flexDirection: 'row',
        gap: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    resetButton: {
        flex: 1,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetButtonText: {
        color: colors.danger,
        fontWeight: "600",
    },
    saveButton: {
        flex: 2,
        backgroundColor: colors.accent,
        borderRadius: radii.md,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: typography.body,
    },
});
