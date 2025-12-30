import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import { SubjectRow } from "@/components/SubjectRow";
import { colors, layout, radii, shadows, spacing, typography } from "@/constants/theme";
import { computeAttendance } from "@/data/attendance";
import { useData } from "@/data/DataContext";
import { useTabSwipe } from "@/hooks/useTabSwipe";
import { RootTabParamList } from "@/navigation/types";

const MIN_ATTENDANCE = 0.8;

type AttendanceScreenProps = BottomTabScreenProps<RootTabParamList, "AttendanceTab">;

export const AttendanceScreen = ({ navigation }: AttendanceScreenProps) => {
  const { subjects, attendanceLogs } = useData();
  const swipeHandlers = useTabSwipe(navigation, "AttendanceTab");

  const statsBySubject = useMemo(() => {
    const entries = subjects.map((subject) => [
      subject.id,
      computeAttendance(attendanceLogs, subject.id, MIN_ATTENDANCE),
    ]);
    return Object.fromEntries(entries);
  }, [attendanceLogs, subjects]);

  const orderedSubjects = [...subjects].sort(
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        {...swipeHandlers}
      >
        <View style={styles.hero}>
          <View>
            <Text style={styles.heroLabel}>Attendance</Text>
            <Text style={styles.heroTitle}>{overallPercentage.toFixed(0)}%</Text>
            <Text style={styles.heroSubtitle}>
              {aggregate.total === 0
                ? "No logs yet."
                : `${aggregate.present}/${aggregate.total} marked`}
            </Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipValue}>{subjects.length}</Text>
              <Text style={styles.heroChipLabel}>Subjects</Text>
            </View>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipValue}>{aggregate.lowCount}</Text>
              <Text style={styles.heroChipLabel}>Below 80%</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Subject wise</Text>
        <Text style={styles.sectionSubtitle}>
          Ordered.
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
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.medium,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: typography.heading,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  heroStats: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  heroChip: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center",
    minWidth: 80,
  },
  heroChipValue: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
  },
  heroChipLabel: {
    color: colors.textSecondary,
    fontSize: typography.tiny,
    marginTop: spacing.xs / 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
