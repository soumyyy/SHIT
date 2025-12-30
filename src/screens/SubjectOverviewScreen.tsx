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

type Props = NativeStackScreenProps<TimetableStackParamList, "SubjectOverview">;

export const SubjectOverviewScreen = ({ route }: Props) => {
  const { subjectId } = route.params;
  const { subjects, slots } = useData();
  const subject = subjects.find((item) => item.id === subjectId);

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
  }, [subjectId]);

  const days = Object.keys(groupedSlots)
    .map((day) => Number(day))
    .sort((a, b) => a - b);

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
            <Text style={styles.hoursPerWeek}>
              {totalHoursPerWeek % 1 === 0
                ? totalHoursPerWeek.toFixed(0)
                : totalHoursPerWeek.toFixed(1)}{" "}
              hours/week
            </Text>
          </View>
          {subject.professor && (
            <Text style={styles.professor}>Professor: {subject.professor}</Text>
          )}
        </View>

        {days.length === 0 ? (
          <Text style={styles.description}>No slots configured for this subject.</Text>
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
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.medium,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  subjectName: {
    color: colors.textPrimary,
    fontSize: typography.display,
    fontWeight: "800",
  },
  hoursPerWeek: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "600",
  },
  professor: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginTop: spacing.xs,
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
});
