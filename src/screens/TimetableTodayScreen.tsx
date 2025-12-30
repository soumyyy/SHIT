import { useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AttendanceModal } from "@/components/AttendanceModal";
import { LectureCard } from "@/components/LectureCard";
import { colors, layout, spacing, typography } from "@/constants/theme";
import { formatTimeRange, getDayLabel, getTodayDayOfWeek } from "@/data/helpers";
import { TimetableSlot } from "@/data/models";
import { useData } from "@/data/DataContext";
import { useTabSwipe } from "@/hooks/useTabSwipe";
import { TimetableStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<TimetableStackParamList, "TimetableToday">;

const formatDateLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);

export const TimetableTodayScreen = ({ navigation }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dayOfWeek = getTodayDayOfWeek(currentDate);
  const { slots, subjects, markAttendance } = useData();
  const swipeResponder = useTabSwipe(navigation, "TimetableTab");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const todaysSlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.dayOfWeek === dayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [dayOfWeek, slots],
  );

  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setModalVisible(true);
  };

  const handleModalSubmit = async (status: "present" | "absent") => {
    if (!selectedSlot) return;
    try {
      await markAttendance({
        slotId: selectedSlot.id,
        subjectId: selectedSlot.subjectId,
        status,
      });
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    } finally {
      setModalVisible(false);
      setSelectedSlot(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]} {...swipeResponder.panHandlers}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dayLabel}>
              {getDayLabel(dayOfWeek)} • {formatDateLabel(currentDate)}
            </Text>
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
          <Text style={styles.sectionTitle}>Lectures</Text>
          <Text style={styles.sectionSubtitle}>Long press to mark attendance</Text>
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
                onLongPress={() => handleLongPress(slot)}
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
      <AttendanceModal
        visible={modalVisible}
        slot={selectedSlot}
        subject={selectedSlot ? subjectsById.get(selectedSlot.subjectId) : undefined}
        onClose={() => {
          setModalVisible(false);
          setSelectedSlot(null);
        }}
        onSubmit={handleModalSubmit}
      />
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
