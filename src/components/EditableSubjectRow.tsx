import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BaseRow } from "./BaseRow";
import { colors, spacing, typography } from "@/constants/theme";

interface EditableSubjectRowProps {
    id: string;
    name: string;
    professor?: string;
    onPress?: () => void;
}

export const EditableSubjectRow = ({ id, name, professor, onPress }: EditableSubjectRowProps) => {
    return (
        <BaseRow onPress={onPress}>
            <View style={styles.content}>
                <View style={styles.idColumn}>
                    <Text style={styles.idText}>{id}</Text>
                </View>

                <View style={styles.infoColumn}>
                    <Text style={styles.title} numberOfLines={1}>{name}</Text>
                    <Text style={styles.professor} numberOfLines={1}>{professor || "Professor"}</Text>
                </View>

                <View style={styles.actionColumn}>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
            </View>
        </BaseRow>
    );
};

const styles = StyleSheet.create({
    content: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        gap: spacing.md,
    },
    idColumn: {
        minWidth: 50,
        justifyContent: "center",
    },
    idText: {
        color: colors.accent,
        fontSize: typography.body,
        fontWeight: "800",
    },
    infoColumn: {
        flex: 1,
        justifyContent: "center",
        gap: 2,
    },
    title: {
        color: colors.textPrimary,
        fontSize: typography.body,
        fontWeight: "600",
    },
    professor: {
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: "500",
    },
    actionColumn: {
        justifyContent: "center",
        alignItems: "flex-end",
    },
});
