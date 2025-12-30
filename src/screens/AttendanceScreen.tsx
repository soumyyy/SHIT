import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { SubjectRow } from "@/components/SubjectRow";
import { colors, layout, spacing, typography } from "@/constants/theme";
import { computeAttendance, projectSemesterCount } from "@/data/attendance";
import { calculateSemesterEndDate } from "@/data/helpers";
import { useData } from "@/data/DataContext";
import { useTabSwipe } from "@/hooks/useTabSwipe";
import { AttendanceStackParamList } from "@/navigation/types";

type AttendanceScreenProps = NativeStackScreenProps<AttendanceStackParamList, "AttendanceList">;

export const AttendanceScreen = ({ navigation }: AttendanceScreenProps) => {
  const { subjects, attendanceLogs, slots, slotOverrides, settings } = useData();
  // Cast navigation to any for swipe handler which expects tab nav structure compatibility
  const swipeHandlers = useTabSwipe(navigation as any, "AttendanceTab");

  const subjectData = useMemo(() => {
    return subjects.map(subject => {
      const stats = computeAttendance(attendanceLogs, subject.id, settings.minAttendanceThreshold);

      const totalProjected = projectSemesterCount(
        subject.id,
        slots,
        slotOverrides,
        settings.semesterStartDate,
        calculateSemesterEndDate(settings.semesterStartDate, settings.semesterWeeks)
      );

      // Simple formula:
      // Need to attend: ceil(total * 80%) classes minimum
      // Can miss: total - minimum required
      const minRequired = Math.ceil(totalProjected * settings.minAttendanceThreshold);
      const maxMissable = totalProjected - minRequired;
      const alreadyMissed = stats.total - stats.present; // This is count of absent logs
      const safeToMiss = maxMissable - alreadyMissed;

      return {
        subject,
        stats,
        projectedTotal: totalProjected,
        safeToMiss
      };
    }).sort((a, b) => a.stats.percentage - b.stats.percentage);
  }, [subjects, attendanceLogs, slots, slotOverrides, settings]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        {...swipeHandlers}
      >
        <Text style={styles.sectionTitle}>Attendance Status</Text>
        <Text style={styles.sectionSubtitle}>
          {/* Safe to miss counts are based on projected semester schedule. */}
        </Text>

        <View style={styles.list}>
          {subjectData.map(({ subject, stats, safeToMiss }) => (
            <SubjectRow
              key={subject.id}
              title={subject.id}
              percentage={stats.percentage}
              present={stats.present}
              total={stats.total}
              safeToMiss={safeToMiss}
              minAttendance={settings.minAttendanceThreshold}
              onPress={() => navigation.navigate("SubjectAttendance", { subjectId: subject.id })}
            />
          ))}
        </View>

        {subjectData.length === 0 && (
          <Text style={styles.emptyText}>No subjects added yet.</Text>
        )}
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
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    fontSize: typography.body,
  },
  list: {
    gap: spacing.xs, // Reduced gap as cards have padding
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
