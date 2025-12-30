import { useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AttendanceModal } from "@/components/AttendanceModal";
import { EditSlotModal } from "@/components/EditSlotModal";
import { LectureCard } from "@/components/LectureCard";
import { colors, layout, radii, spacing, typography } from "@/constants/theme";
import { formatTimeRange, getDayLabel, getEffectiveSlots, getTodayDayOfWeek } from "@/data/helpers";
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dayOfWeek = getTodayDayOfWeek(selectedDate);
  const { slots, subjects, attendanceLogs, markAttendance, settings, slotOverrides, addSlotOverride } = useData();
  const swipeHandlers = useTabSwipe(navigation, "TimetableTab");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60_000);
    return () => clearInterval(timer);
  }, []);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === currentDate.toDateString();

  // Calculate date string once for reuse
  const selectedDateString = selectedDate.toISOString().split("T")[0];

  // Check if selected date is before semester start
  const isBeforeSemester = selectedDateString < settings.semesterStartDate;

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const todaysSlots = useMemo(
    () => getEffectiveSlots(selectedDateString, slots, slotOverrides),
    [selectedDateString, slots, slotOverrides],
  );

  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleLongPress = (slot: TimetableSlot) => {
    setSelectedSlot(slot);
    setModalVisible(true);
  };

  const handleOpenEdit = () => {
    setModalVisible(false);
    setEditModalVisible(true);
  };

  const handleCancelLecture = async () => {
    if (!selectedSlot) return;
    try {
      await addSlotOverride({
        originalSlotId: selectedSlot.id,
        date: selectedDateString,
        type: "cancelled",
      });
      Alert.alert("Success", "Lecture cancelled for this date");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleChangeDate = async (newDate: string, newTime: string) => {
    if (!selectedSlot) return;
    try {
      // Cancel on current date
      await addSlotOverride({
        originalSlotId: selectedSlot.id,
        date: selectedDateString,
        type: "cancelled",
      });
      // Add on new date
      await addSlotOverride({
        originalSlotId: selectedSlot.id,
        date: newDate,
        type: "added",
        subjectId: selectedSlot.subjectId,
        startTime: newTime,
        durationMinutes: selectedSlot.durationMinutes,
        room: selectedSlot.room,
      });
      Alert.alert("Success", `Lecture rescheduled to ${newDate} at ${newTime}`);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
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

  // Find existing attendance for selected slot on selected date
  const existingAttendance = selectedSlot
    ? attendanceLogs.find(
      (log) => log.slotId === selectedSlot.id && log.date === selectedDateString
    )
    : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        {...swipeHandlers}
      >
        <View style={styles.headerRow}>
          <View style={styles.dateNavigation}>
            <Pressable style={styles.navButton} onPress={goToPreviousDay}>
              <Text style={styles.navButtonText}>←</Text>
            </Pressable>
            <View style={styles.dateInfo}>
              <Text style={styles.dayLabel}>
                {formatDateLabel(selectedDate)}
              </Text>
              <Text style={styles.slotCount}>
                {isBeforeSemester ? 0 : todaysSlots.length} slot{(isBeforeSemester || todaysSlots.length !== 1) ? "s" : ""}
              </Text>
            </View>
            <Pressable style={styles.navButton} onPress={goToNextDay}>
              <Text style={styles.navButtonText}>→</Text>
            </Pressable>
          </View>
          <View style={styles.headerButtons}>
            {!isToday && (
              <Pressable style={styles.todayButton} onPress={goToToday}>
                <Text style={styles.todayButtonText}>Today</Text>
              </Pressable>
            )}
            <Pressable
              style={styles.compactButton}
              onPress={() => navigation.navigate("FullTimetable")}
            >
              <Text style={styles.compactButtonText}>Full timetable</Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => navigation.navigate("ManageTimetable")}
            >
              <Ionicons name="settings-sharp" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lectures</Text>
          {/* <Text style={styles.sectionSubtitle}>Long press to mark attendance</Text> */}
        </View>

        {isBeforeSemester ? (
          <View style={styles.semesterMessage}>
            <Text style={styles.semesterMessageTitle}>Classes haven't started yet</Text>
            <Text style={styles.semesterMessageText}>
              Semester begins on {new Date(settings.semesterStartDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        ) : todaysSlots.length === 0 ? (
          <Text style={styles.emptyText}>Enjoy the free day 🎉</Text>
        ) : (
          todaysSlots.map((slot) => {
            const subject = subjectsById.get(slot.subjectId);
            const attendanceStatus = attendanceLogs.find(
              (log) => log.slotId === slot.id && log.date === selectedDateString,
            )?.status;
            return (
              <LectureCard
                key={slot.id}
                title={subject?.id ?? "Subject"}
                subtitle={formatTimeRange(slot.startTime, slot.durationMinutes)}
                room={slot.room || subject?.defaultRoom}
                status={attendanceStatus ?? null}
                onPress={() =>
                  navigation.navigate("SubjectOverview", { subjectId: slot.subjectId })
                }
                onLongPress={() => handleLongPress(slot)}
              />
            );
          })
        )}
      </ScrollView>
      <AttendanceModal
        visible={modalVisible}
        slot={selectedSlot}
        subject={selectedSlot ? subjectsById.get(selectedSlot.subjectId) : undefined}
        existingStatus={existingAttendance?.status}
        onClose={() => {
          setModalVisible(false);
          setSelectedSlot(null);
        }}
        onSubmit={handleModalSubmit}
        onEdit={handleOpenEdit}
      />
      <EditSlotModal
        visible={editModalVisible}
        slot={selectedSlot}
        subject={selectedSlot ? subjectsById.get(selectedSlot.subjectId) : undefined}
        currentDate={selectedDateString}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedSlot(null);
        }}
        onCancel={handleCancelLecture}
        onChangeDate={handleChangeDate}
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
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  headerRow: {
    flexDirection: "column",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dateNavigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    color: colors.accent,
    fontSize: typography.heading,
    fontWeight: "600",
  },
  dateInfo: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  todayButton: {
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accent + "15",
  },
  todayButtonText: {
    color: colors.accent,
    fontSize: typography.small,
    fontWeight: "700",
    letterSpacing: 0.5,
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
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.glassBorder,
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
  semesterMessage: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: "center",
  },
  semesterMessageTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  semesterMessageText: {
    color: colors.textSecondary,
    fontSize: typography.small,
    textAlign: "center",
  },
});
