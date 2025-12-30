import { useState, useEffect } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardAvoidingView } from "react-native";
import { colors, radii, spacing, typography } from "@/constants/theme";
import { Subject } from "@/data/models";

interface SubjectFormModalProps {
    visible: boolean;
    subject: Subject | null; // null means creating new
    onClose: () => void;
    onSave: (subject: Subject) => void;
    onDelete?: (id: string) => void;
}

export const SubjectFormModal = ({
    visible,
    subject,
    onClose,
    onSave,
    onDelete,
}: SubjectFormModalProps) => {
    const isEditing = !!subject;

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [professor, setProfessor] = useState("");

    // Reset or populate form when modal opens or subject changes
    useEffect(() => {
        if (visible) {
            if (subject) {
                setId(subject.id);
                setName(subject.name);
                setProfessor(subject.professor || "");
            } else {
                setId("");
                setName("");
                setProfessor("");
            }
        }
    }, [visible, subject]);

    const handleSave = () => {
        if (!id.trim() || !name.trim()) {
            Alert.alert("Missing Fields", "Please fill in both Subject Code and Subject Name.");
            return; // Basic validation
        }

        const newSubject: Subject = {
            id: id.trim(),
            name: name.trim(),
            professor: professor.trim() || undefined,
            createdAt: subject?.createdAt || new Date().toISOString(),
        };

        onSave(newSubject);
        onClose();
    };

    const handleDelete = () => {
        if (onDelete && subject) {
            onDelete(subject.id);
            onClose();
        }
    };

    if (!visible) return null;

    return (
        <Modal transparent visible animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <Pressable style={styles.backdropTouchable} onPress={onClose} />
                    <View style={styles.card}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.title}>{isEditing ? "Edit Subject" : "New Subject"}</Text>

                            <View style={styles.section}>
                                <Text style={styles.label}>Subject Code / ID</Text>
                                <TextInput
                                    style={[styles.input, isEditing && styles.inputDisabled]}
                                    value={id}
                                    onChangeText={setId}
                                    placeholder="e.g. ATSA"
                                    placeholderTextColor={colors.textMuted}
                                    editable={!isEditing} // Lock ID when editing
                                    autoCapitalize="characters"
                                />
                                {/* {isEditing && <Text style={styles.hint}> </Text>} */}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Subject Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g. Applied Time Series Analysis"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.label}>Professor (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={professor}
                                    onChangeText={setProfessor}
                                    placeholder="e.g. Dr. Smith"
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <Pressable style={styles.primaryButton} onPress={handleSave}>
                                <Text style={styles.primaryButtonText}>{isEditing ? "Save Changes" : "Create Subject"}</Text>
                            </Pressable>

                            {isEditing && onDelete && (
                                <Pressable style={styles.dangerButton} onPress={handleDelete}>
                                    <Text style={styles.dangerButtonText}>Delete Subject</Text>
                                </Pressable>
                            )}

                            <Pressable style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Cancel</Text>
                            </Pressable>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    keyboardView: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdropTouchable: {
        flex: 1,
    },
    card: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radii.xl,
        borderTopRightRadius: radii.xl,
        padding: spacing.lg,
        maxHeight: "85%",
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    title: {
        color: colors.textPrimary,
        fontSize: typography.heading,
        fontWeight: "700",
        marginBottom: spacing.lg,
    },
    section: {
        marginBottom: spacing.md,
    },
    label: {
        color: colors.textSecondary,
        fontSize: typography.small,
        marginBottom: spacing.xs,
        fontWeight: "600",
    },
    input: {
        backgroundColor: colors.card,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        padding: spacing.md,
        color: colors.textPrimary,
        fontSize: typography.body,
    },
    inputDisabled: {
        opacity: 0.6,
        backgroundColor: colors.background,
    },
    hint: {
        color: colors.textMuted,
        fontSize: typography.tiny,
        marginTop: spacing.xs,
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
        marginTop: spacing.md,
    },
    dangerButtonText: {
        color: colors.danger,
        fontSize: typography.body,
        fontWeight: "700",
    },
    closeButton: {
        marginTop: spacing.sm,
        padding: spacing.md,
        alignItems: "center",
    },
    closeButtonText: {
        color: colors.textSecondary,
        fontSize: typography.body,
        fontWeight: "600",
    },
});
