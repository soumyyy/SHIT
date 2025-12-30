import { useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DaySection } from "@/components/DaySection";
import { LectureCard } from "@/components/LectureCard";
import { colors, layout, radii, shadows, spacing, typography } from "@/constants/theme";
import { formatTimeRange, getDayLabel } from "@/data/helpers";
import { useData } from "@/data/DataContext";
import { TimetableStackParamList } from "@/navigation/types";
import { computeAttendance } from "@/data/attendance";

type Props = NativeStackScreenProps<TimetableStackParamList, "SubjectOverview">;

export const SubjectOverviewScreen = ({ route }: Props) => {
  const { subjectId } = route.params;
  const { subjects, slots, attendanceLogs, slotOverrides, settings } = useData();
  const subject = subjects.find((item) => item.id === subjectId);

  // Group regular slots
  const groupedSlots = useMemo(() => {
    const subjectSlots = slots.filter((slot) => slot.subjectId === subjectId);
    const groups: Record<number, typeof subjectSlots> = {};
    subjectSlots.forEach((slot) => {
      if (!groups[slot.dayOfWeek]) {
        groups[slot.dayOfWeek] = [];
      }
      groups[slot.dayOfWeek].push(slot);
    });

    Object.values(groups).forEach((list) =>
      list.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    );

    return groups;
  }, [subjectId, slots]);

  const days = Object.keys(groupedSlots)
    .map((day) => Number(day))
    .sort((a, b) => a - b);

  // Stats
  const stats = useMemo(() =>
    computeAttendance(attendanceLogs, subjectId, settings.minAttendanceThreshold),
    [attendanceLogs, subjectId, settings.minAttendanceThreshold]
  );

  // Upcoming Changes (Future Overrides)
  const upcomingChanges = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return slotOverrides
      .filter(o =>
        o.date >= today &&
        (o.subjectId === subjectId ||
          slots.find(s => s.id === o.originalSlotId)?.subjectId === subjectId)
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [slotOverrides, subjectId, slots]);

  if (!subject) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Subject not found</Text>
      </View>
    );
  }

  // Calculate total hours per week
  const totalMinutesPerWeek = slots
    .filter((slot) => slot.subjectId === subjectId)
    .reduce((sum, slot) => sum + slot.durationMinutes, 0);
  const totalHoursPerWeek = totalMinutesPerWeek / 60;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
            {totalHoursPerWeek % 1 === 0
              ? totalHoursPerWeek.toFixed(0)
              : totalHoursPerWeek.toFixed(1)}{" "}
            hours/week scheduled
          </Text>
        </View>

        {upcomingChanges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Changes</Text>
            {upcomingChanges.map(override => (
              <View key={override.id} style={styles.changeCard}>
                <Text style={styles.changeDate}>{new Date(override.date).toDateString()}</Text>
                <Text style={[
                  styles.changeType,
                  override.type === 'cancelled' ? styles.textDanger : styles.textSuccess
                ]}>
                  {override.type === 'cancelled' ? 'Cancelled' : 'Rescheduled / Extra'}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Schedule</Text>
          {days.length === 0 ? (
            <Text style={styles.description}>No regular slots configured.</Text>
          ) : (
            days.map((day) => (
              <DaySection key={day} title={getDayLabel(day)}>
                {groupedSlots[day].map((slot) => (
                  <LectureCard
                    key={slot.id}
                    title={formatTimeRange(slot.startTime, slot.durationMinutes)}
                    subtitle={`Room ${slot.room}`}
                  />
                ))}
              </DaySection>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
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
  changeCard: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  changeDate: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  changeType: {
    fontWeight: '700',
    fontSize: typography.small,
  },
  textSuccess: { color: colors.success },
  textDanger: { color: colors.danger },
});
