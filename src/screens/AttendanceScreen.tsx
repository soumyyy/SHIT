import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SubjectRow } from "@/components/SubjectRow";
import { colors, layout, radii, shadows, spacing, typography } from "@/constants/theme";
import { computeAttendance } from "@/data/attendance";
import { mockAttendanceLogs, mockSubjects } from "@/data/mockData";

const MIN_ATTENDANCE = 0.8;

export const AttendanceScreen = () => {
  const statsBySubject = useMemo(() => {
    const entries = mockSubjects.map((subject) => [
      subject.id,
      computeAttendance(mockAttendanceLogs, subject.id, MIN_ATTENDANCE),
    ]);
    return Object.fromEntries(entries);
  }, []);

  const orderedSubjects = [...mockSubjects].sort(
    (a, b) => statsBySubject[a.id].percentage - statsBySubject[b.id].percentage,
  );

  const aggregate = orderedSubjects.reduce(
    (acc, subject) => {
      const stats = statsBySubject[subject.id];
      acc.present += stats.present;
      acc.total += stats.total;
      acc.lowCount += stats.isBelowThreshold ? 1 : 0;
      return acc;
    },
    { present: 0, total: 0, lowCount: 0 },
  );

  const overallPercentage =
    aggregate.total === 0 ? 100 : (aggregate.present / aggregate.total) * 100;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.backdrop} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Attendance pulse</Text>
          <Text style={styles.heroTitle}>{overallPercentage.toFixed(0)}%</Text>
          <Text style={styles.heroSubtitle}>
            {aggregate.total === 0
              ? "No logs yet — start tracking from the timetable tab."
              : `${aggregate.present} / ${aggregate.total} sessions marked`}
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipValue}>{mockSubjects.length}</Text>
              <Text style={styles.heroChipLabel}>Subjects</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipValue}>{aggregate.lowCount}</Text>
              <Text style={styles.heroChipLabel}>Below 80%</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipValue}>{(MIN_ATTENDANCE * 100).toFixed(0)}%</Text>
              <Text style={styles.heroChipLabel}>Threshold</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Subject breakdown</Text>
        <Text style={styles.sectionSubtitle}>
          Ordered from lowest to highest so you can rescue at-risk classes first.
        </Text>

        <View style={styles.list}>
          {orderedSubjects.map((subject) => {
            const stats = statsBySubject[subject.id];
            const subtitle =
              stats.total === 0
                ? "No attendance logged yet"
                : `${stats.present}/${stats.total} present • ${stats.total - stats.present} missed`;
            return (
              <SubjectRow
                key={subject.id}
                title={subject.name}
                subtitle={subtitle}
                percentage={stats.percentage}
                highlight={stats.isBelowThreshold}
              />
            );
          })}
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
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.medium,
  },
  heroLabel: {
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
    fontSize: typography.tiny,
  },
  heroTitle: {
    color: colors.accent,
    fontSize: typography.display,
    fontWeight: "800",
    marginTop: spacing.sm,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  heroStats: {
    flexDirection: "row",
    gap: spacing.md,
  },
  heroChip: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "flex-start",
  },
  heroChipValue: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "800",
  },
  heroChipLabel: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.sm,
  },
});
