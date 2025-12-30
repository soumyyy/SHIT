import { useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, layout, radii, shadows, spacing, typography } from "@/constants/theme";
import { useData } from "@/data/DataContext";
import { AttendanceStackParamList } from "@/navigation/types";
import { computeAttendance, projectSemesterCount } from "@/data/attendance";
import { calculateSemesterEndDate, formatLocalDate } from "@/data/helpers";

type Props = NativeStackScreenProps<AttendanceStackParamList, "SubjectAttendance">;

export const SubjectAttendanceScreen = ({ route }: Props) => {
    const { subjectId } = route.params;
    const { subjects, slots, attendanceLogs, slotOverrides, settings } = useData();
    const subject = subjects.find((item) => item.id === subjectId);

    // Stats
    const stats = useMemo(() =>
        computeAttendance(attendanceLogs, subjectId, settings.minAttendanceThreshold),
        [attendanceLogs, subjectId, settings.minAttendanceThreshold]
    );

    const safeToMissInfo = useMemo(() => {
        const projectedTotal = projectSemesterCount(
            subjectId,
            slots,
            slotOverrides,
            settings.semesterStartDate,
            calculateSemesterEndDate(settings.semesterStartDate, settings.semesterWeeks)
        );

        // Simple formula:
        // Need to attend: ceil(total * 80%) classes minimum
        // Can miss: total - minimum required
        const minRequired = Math.ceil(projectedTotal * settings.minAttendanceThreshold);
        const maxMissable = projectedTotal - minRequired;
        const alreadyMissed = stats.total - stats.present;
        const safeToMiss = maxMissable - alreadyMissed;

        return {
            safeToMiss,
            projectedTotal
        };
    }, [subjectId, slots, slotOverrides, settings, stats]);

    // History (Past Logs + Past Cancellations)
    const history = useMemo(() => {
        const today = formatLocalDate(new Date());
        const items: Array<{
            id: string;
            date: string;
            time: string; // HH:MM
            status: 'present' | 'absent' | 'cancelled';
            details?: string;
        }> = [];

        // 1. Add Attendance Logs
        attendanceLogs
            .filter(log => log.subjectId === subjectId)
            .forEach(log => {
                let time = "00:00";
                const regularSlot = slots.find(s => s.id === log.slotId);
                if (regularSlot) {
                    time = regularSlot.startTime;
                } else {
                    const override = slotOverrides.find(o => o.id === log.slotId);
                    if (override && override.startTime) {
                        time = override.startTime;
                    }
                }

                items.push({
                    id: log.id,
                    date: log.date,
                    time: time,
                    status: log.status,
                });
            });

        // 2. Add Cancellations (that are in the past)
        slotOverrides
            .filter(o =>
                o.type === 'cancelled' &&
                o.date < today &&
                slots.find(s => s.id === o.originalSlotId)?.subjectId === subjectId
            )
            .forEach(o => {
                const slot = slots.find(s => s.id === o.originalSlotId);
                items.push({
                    id: o.id,
                    date: o.date,
                    time: slot?.startTime || "00:00",
                    status: 'cancelled',
                });
            });

        return items.sort((a, b) => b.date.localeCompare(a.date)); // Newest first
    }, [attendanceLogs, slotOverrides, slots, subjectId]);

    if (!subject) {
        return (
            <View style={styles.fallbackContainer}>
                <Text style={styles.fallbackText}>Subject not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <View style={styles.titleRow}>
                        <Text style={styles.subjectName}>{subject.name}</Text>
                        <View style={[styles.badge, stats.isBelowThreshold ? styles.badgeDanger : styles.badgeSuccess]}>
                            <Text style={[styles.badgeText, stats.isBelowThreshold ? styles.badgeTextDanger : styles.badgeTextSuccess]}>
                                {stats.percentage.toFixed(0)}%
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.professor}>
                        {stats.present} / {stats.total} classes attended
                    </Text>
                    <Text style={styles.hoursPerWeek}>
                        {safeToMissInfo.safeToMiss >= 0
                            ? `You can miss ${safeToMissInfo.safeToMiss} more classes safely`
                            : `You are over the limit by ${Math.abs(safeToMissInfo.safeToMiss)} classes`}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>History</Text>
                    {history.length === 0 ? (
                        <Text style={styles.description}>No classes recorded yet.</Text>
                    ) : (
                        <View style={styles.historyList}>
                            {history.map(item => (
                                <View key={item.id} style={styles.historyRow}>
                                    <View style={styles.historyLeft}>
                                        <Text style={styles.historyDate}>{(() => {
                                            const [y, m, d] = item.date.split("-").map(Number);
                                            return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                        })()}</Text>
                                        <Text style={styles.historyTime}>{item.time}</Text>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        item.status === 'present' && styles.statusPresent,
                                        item.status === 'absent' && styles.statusAbsent,
                                        item.status === 'cancelled' && styles.statusCancelled,
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            item.status === 'present' && styles.textSuccess,
                                            item.status === 'absent' && styles.textDanger,
                                            item.status === 'cancelled' && styles.textMuted,
                                        ]}>
                                            {item.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: layout.screenPadding,
        paddingBottom: spacing.lg,
        paddingTop: spacing.sm,
    },
    hero: {
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: spacing.md,
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...shadows.medium,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.xs,
    },
    subjectName: {
        color: colors.textPrimary,
        fontSize: typography.heading,
        fontWeight: "800",
        flex: 1,
    },
    hoursPerWeek: {
        color: colors.textMuted,
        fontSize: typography.small,
        fontWeight: "600",
        marginTop: spacing.xs,
    },
    professor: {
        color: colors.textSecondary,
        fontSize: typography.body,
    },
    description: {
        color: colors.textSecondary,
        fontSize: typography.body,
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
    fallbackText: {
        color: colors.textPrimary,
        fontSize: typography.heading,
        fontWeight: "600",
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: radii.md,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    badgeSuccess: {
        backgroundColor: colors.success + '15',
        borderColor: colors.success,
    },
    badgeDanger: {
        backgroundColor: colors.danger + '15',
        borderColor: colors.danger,
    },
    badgeText: {
        fontSize: typography.small,
        fontWeight: "700",
    },
    badgeTextSuccess: { color: colors.success },
    badgeTextDanger: { color: colors.danger },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: typography.heading,
        fontWeight: "700",
        marginBottom: spacing.sm,
    },
    textSuccess: { color: colors.success },
    textDanger: { color: colors.danger },
    textMuted: { color: colors.textMuted },

    // History Styles
    historyList: {
        backgroundColor: colors.card,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        padding: spacing.sm,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    historyLeft: {
        gap: 2,
    },
    historyDate: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: typography.body,
    },
    historyTime: {
        color: colors.textSecondary,
        fontSize: typography.small,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radii.sm,
        minWidth: 70,
        alignItems: 'center',
    },
    statusPresent: {
        backgroundColor: colors.success + '15',
    },
    statusAbsent: {
        backgroundColor: colors.danger + '15',
    },
    statusCancelled: {
        backgroundColor: colors.surface, // neutral
    },
    statusText: {
        fontSize: typography.tiny,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
