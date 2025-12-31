import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { SubjectRow } from "@/components/SubjectRow";
import { colors, layout, spacing, typography } from "@/constants/theme";
import { useData } from "@/data/DataContext";
import { useTabSwipe } from "@/hooks/useTabSwipe";
import { computeAttendance, projectSemesterCount } from "@/data/attendance";
import { calculateSemesterEndDate } from "@/data/helpers";
import { AttendanceStackParamList } from "@/navigation/types";

type AttendanceScreenProps = NativeStackScreenProps<AttendanceStackParamList, "List">;

export const AttendanceScreen = ({ navigation }: AttendanceScreenProps) => {
  const { subjects, attendanceLogs, slots, slotOverrides, settings } = useData();
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

      const minRequired = Math.ceil(totalProjected * settings.minAttendanceThreshold);
      const maxMissable = totalProjected - minRequired;
      const alreadyMissed = stats.total - stats.present;
      const safeToMiss = maxMissable - alreadyMissed;

      return {
        subject,
        stats,
        safeToMiss
      };
    }).sort((a, b) => a.stats.percentage - b.stats.percentage);
  }, [subjects, attendanceLogs, slots, slotOverrides, settings]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        {...swipeHandlers}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Attendance</Text>
            <Text style={styles.headerSubtitle}>
              {subjectData.length} subject{subjectData.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

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
    paddingTop: spacing.sm,
  },
  headerRow: {
    marginBottom: spacing.md,
  },
  headerInfo: {
    gap: spacing.xs / 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "600",
  },
  list: {
    gap: spacing.xs,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
