import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BaseRow } from "./BaseRow";
import { colors, spacing, typography } from "@/constants/theme";
import { TimetableSlot, Subject } from "@/data/models";

interface SlotRowProps {
    slot: TimetableSlot;
    subject: Subject;
    onPress?: () => void;
}

const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
        return `${hours}h ${mins}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else {
        return `${mins}m`;
    }
};

export const SlotRow = ({ slot, subject, onPress }: SlotRowProps) => {
    return (
        <BaseRow onPress={onPress}>
            <View style={styles.content}>
                {/* Column 1: Time & Duration */}
                <View style={styles.timeColumn}>
                    <Text style={styles.timeText}>{formatTime(slot.startTime)}</Text>
                    <Text style={styles.durationText}>{formatDuration(slot.durationMinutes)}</Text>
                </View>

                {/* Column 2: Subject & Details */}
                <View style={styles.infoColumn}>
                    <Text style={styles.subjectText} numberOfLines={1}>{subject.name}</Text>
                    <Text style={styles.detailsText} numberOfLines={1}>
                        {subject.professor && `${subject.professor} • `}{slot.room}
                    </Text>
                </View>

                {/* Column 3: Arrow */}
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
    timeColumn: {
        minWidth: 70,
        justifyContent: "center",
        gap: 2,
    },
    timeText: {
        color: colors.textPrimary,
        fontSize: typography.body,
        fontWeight: "700",
    },
    durationText: {
        color: colors.textMuted,
        fontSize: typography.tiny,
        fontWeight: "600",
    },
    infoColumn: {
        flex: 1,
        justifyContent: "center",
        gap: 2,
    },
    subjectText: {
        color: colors.accent,
        fontSize: typography.body,
        fontWeight: "700",
    },
    detailsText: {
        color: colors.textSecondary,
        fontSize: typography.small,
        fontWeight: "500",
    },
    actionColumn: {
        justifyContent: "center",
        alignItems: "flex-end",
    },
});
