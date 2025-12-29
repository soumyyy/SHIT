import { useMemo } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LectureCard } from "@/components/LectureCard";
import { colors, layout, radii, shadows, spacing, typography } from "@/constants/theme";
import { formatTimeRange, getDayLabel, getTodayDayOfWeek } from "@/data/helpers";
import { mockSlots, mockSubjects } from "@/data/mockData";
import { TimetableStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<TimetableStackParamList, "TimetableToday">;

const formatStartLabel = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

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

  const nextLecture = todaysSlots[0];
  const nextSubject = nextLecture ? subjectsById.get(nextLecture.subjectId) : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.backdrop} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroLabel}>{getDayLabel(dayOfWeek)}</Text>
              <Text style={styles.heroTitle}>Your day at a glance</Text>
            </View>
            <Text style={styles.heroCount}>
              {todaysSlots.length}
              <Text style={styles.heroCountLabel}> slots</Text>
            </Text>
          </View>
          <Text style={styles.heroSubtitle}>
            {nextLecture
              ? `Next: ${nextSubject?.name ?? "Lecture"} at ${formatStartLabel(
                  nextLecture.startTime,
                )}`
              : "No lectures scheduled today."}
          </Text>
          <Pressable
            onPress={() => navigation.navigate("FullTimetable")}
            style={styles.heroButton}
          >
            <Text style={styles.heroButtonText}>View full timetable</Text>
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
                  // Attendance modal will be implemented later.
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
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.medium,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  heroLabel: {
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: typography.tiny,
    fontWeight: "700",
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.display,
    fontWeight: "800",
  },
  heroCount: {
    color: colors.accent,
    fontSize: typography.display,
    fontWeight: "800",
  },
  heroCountLabel: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: "600",
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginBottom: spacing.lg,
  },
  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  heroButtonText: {
    color: "#FFF2E0",
    fontWeight: "700",
    fontSize: typography.small,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
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
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  quickActionText: {
    color: colors.accent,
    fontSize: typography.small,
    fontWeight: "700",
  },
});
