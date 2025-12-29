import { useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LectureCard } from "@/components/LectureCard";
import { colors, layout, spacing, typography } from "@/constants/theme";
import { formatTimeRange, getDayLabel, getTodayDayOfWeek } from "@/data/helpers";
import { mockSlots, mockSubjects } from "@/data/mockData";
import { TimetableStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<TimetableStackParamList, "TimetableToday">;

export const TimetableTodayScreen = ({ navigation }: Props) => {
  const dayOfWeek = getTodayDayOfWeek();

  const subjectsById = useMemo(
    () => new Map(mockSubjects.map((subject) => [subject.id, subject])),
    [],
  );

  const todaysSlots = useMemo(
    () =>
      mockSlots
        .filter((slot) => slot.dayOfWeek === dayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [dayOfWeek],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dayLabel}>{getDayLabel(dayOfWeek)}</Text>
            <Text style={styles.slotCount}>
              {todaysSlots.length} slot{todaysSlots.length === 1 ? "" : "s"}
            </Text>
          </View>
          <Pressable
            style={styles.compactButton}
            onPress={() => navigation.navigate("FullTimetable")}
          >
            <Text style={styles.compactButtonText}>Full timetable</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s lectures</Text>
          <Text style={styles.sectionSubtitle}>Tap for overview • long-press to log</Text>
        </View>

        {todaysSlots.length === 0 ? (
          <Text style={styles.emptyText}>Enjoy the free day 🎉</Text>
        ) : (
          todaysSlots.map((slot) => {
            const subject = subjectsById.get(slot.subjectId);
            return (
              <LectureCard
                key={slot.id}
                title={subject?.name ?? "Subject"}
                subtitle={formatTimeRange(slot.startTime, slot.durationMinutes)}
                room={slot.room || subject?.defaultRoom}
                onPress={() =>
                  navigation.navigate("SubjectOverview", { subjectId: slot.subjectId })
                }
                onLongPress={() => {
                  // TODO: open attendance modal
                }}
                rightElement={
                  <View style={styles.quickAction}>
                    <Text style={styles.quickActionText}>Mark</Text>
                  </View>
                }
              />
            );
          })
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
    paddingHorizontal: layout.screenPadding - spacing.sm,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  dayLabel: {
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: typography.tiny,
    fontWeight: "700",
  },
  slotCount: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "700",
  },
  compactButton: {
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.glass,
  },
  compactButtonText: {
    color: colors.accent,
    fontSize: typography.small,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  quickAction: {
    backgroundColor: colors.glass,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  quickActionText: {
    color: colors.accent,
    fontSize: typography.small,
    fontWeight: "700",
  },
});
