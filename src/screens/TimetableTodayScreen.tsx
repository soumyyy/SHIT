import { useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { AttendanceModal } from "@/components/AttendanceModal";
import { EditSlotModal } from "@/components/EditSlotModal";
import { LectureCard } from "@/components/LectureCard";
import { colors, layout, radii, spacing, typography } from "@/constants/theme";
import { formatLocalDate, formatTimeRange, getDayLabel, getEffectiveSlots, getTodayDayOfWeek, hasReachedLectureLimit, isHoliday } from "@/data/helpers";
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
  const { slots, subjects, attendanceLogs, markAttendance, unmarkAttendance, settings, slotOverrides, addSlotOverride, holidays, addHoliday, removeHoliday } = useData();
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
  const selectedDateString = formatLocalDate(selectedDate);
  const isCurrentHoliday = isHoliday(selectedDateString, holidays);
  const currentHolidayInfo = holidays.find(h => h.date === selectedDateString);

  // Check if selected date is before semester start
  const isBeforeSemester = selectedDateString < settings.semesterStartDate;

  const subjectsById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const todaysSlots = useMemo(
    () => {
      // If today is a holiday, return empty array (no classes)
      if (isHoliday(selectedDateString, holidays)) {
        return [];
      }

      const effectiveSlots = getEffectiveSlots(selectedDateString, slots, slotOverrides);

      // Filter out subjects that have reached their lecture limit
      return effectiveSlots.filter(slot => {
        const hasReached = hasReachedLectureLimit(
          slot.subjectId,
          slots,
          slotOverrides,
          settings.semesterStartDate,
          selectedDateString
        );
        return !hasReached;
      });
    },
    [selectedDateString, slots, slotOverrides, settings.semesterStartDate, holidays],
  );

  const daySpanHours = useMemo(() => {
    if (todaysSlots.length === 0) return 0;

    let minStart = 24 * 60; // Max possible minutes
    let maxEnd = 0;

    todaysSlots.forEach((slot) => {
      const [h, m] = slot.startTime.split(":").map(Number);
      const startMins = h * 60 + m;
      const endMins = startMins + slot.durationMinutes;

      if (startMins < minStart) minStart = startMins;
      if (endMins > maxEnd) maxEnd = endMins;
    });

    if (maxEnd <= minStart) return 0;

    // Round to 1 decimal place if needed
    const hours = (maxEnd - minStart) / 60;
    return Math.round(hours * 10) / 10;
  }, [todaysSlots]);

  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
        date: selectedDateString,
      });
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    } finally {
      setModalVisible(false);
      setSelectedSlot(null);
    }
  };

  const handleUnmark = async () => {
    if (!selectedSlot) return;
    try {
      await unmarkAttendance(selectedSlot.id, selectedDateString);
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
            <Pressable style={styles.dateInfo} onPress={() => setShowDatePicker(!showDatePicker)}>
              <Text style={styles.dayLabel}>
                {formatDateLabel(selectedDate)}
              </Text>
              <Text style={styles.slotCount}>
                {isBeforeSemester ? 0 : daySpanHours} hour{(isBeforeSemester || daySpanHours !== 1) ? "s" : ""}
              </Text>
            </Pressable>
            {!isBeforeSemester && (
              <Pressable
                style={[
                  styles.navButton,
                  isCurrentHoliday && styles.iconButtonActive,
                ]}
                onPress={() => {
                  if (isCurrentHoliday) {
                    removeHoliday(selectedDateString);
                  } else {
                    Alert.prompt(
                      "Mark as Holiday",
                      "Enter holiday name (optional)",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Mark",
                          onPress: (name?: string) => addHoliday(selectedDateString, name || undefined),
                        },
                      ],
                      "plain-text"
                    );
                  }
                }}
              >
                <Ionicons
                  name={isCurrentHoliday ? "calendar" : "calendar-outline"}
                  size={16}
                  color={isCurrentHoliday ? colors.background : colors.textSecondary}
                />
              </Pressable>
            )}
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
              <Text style={styles.compactButtonText}>Timetable</Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => navigation.navigate("ManageTimetable")}
            >
              <Ionicons name="settings-sharp" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {showDatePicker && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date(2026, 11, 31)} // Dec 31, 2026
              minimumDate={new Date(2026, 0, 1)} // Jan 1, 2026
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) {
                  // Force year to 2026
                  const fixedDate = new Date(2026, date.getMonth(), date.getDate());
                  setSelectedDate(fixedDate);
                }
              }}
            />
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lectures</Text>
        </View>

        {isBeforeSemester ? (
          <View style={styles.semesterMessage}>
            <Text style={styles.semesterMessageTitle}>Classes haven't started yet</Text>
            <Text style={styles.semesterMessageText}>
              Semester begins on {(() => {
                const [y, m, d] = settings.semesterStartDate.split("-").map(Number);
                return new Date(y, m - 1, d).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
              })()}
            </Text>
          </View>
        ) : isCurrentHoliday ? (
          <View style={styles.holidayMessage}>
            <Text style={styles.holidayIcon}>🎉</Text>
            <Text style={styles.holidayTitle}>Holiday</Text>
            {currentHolidayInfo?.name && (
              <Text style={styles.holidayName}>{currentHolidayInfo.name}</Text>
            )}
          </View>
        ) : todaysSlots.length === 0 ? (
          <Text style={styles.emptyText}>Enjoy the free day 🎉</Text>
        ) : (
          <View>
            {todaysSlots.map((slot) => {
              const subject = subjectsById.get(slot.subjectId);
              const attendanceStatus = attendanceLogs.find(
                (log) => log.slotId === slot.id && log.date === selectedDateString,
              )?.status;
              return (
                <LectureCard
                  key={slot.id}
                  title={subject?.id ?? "Subject"}
                  subtitle={formatTimeRange(slot.startTime, slot.durationMinutes)}
                  room={slot.room}
                  status={attendanceStatus ?? null}
                  onPress={() =>
                    navigation.navigate("SubjectOverview", { subjectId: slot.subjectId })
                  }
                  onLongPress={() => handleLongPress(slot)}
                />
              );
            })}
          </View>
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
        onUnmark={handleUnmark}
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
  datePickerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
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
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer" as any,
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
  iconButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  holidayToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.accent + "20",
    borderRadius: radii.md,
  },
  holidayToggleButtonActive: {
    backgroundColor: colors.accent,
  },
  holidayToggleText: {
    color: colors.accent,
    fontSize: typography.small,
    fontWeight: "600",
  },
  holidayToggleTextActive: {
    color: colors.background,
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
  holidayMessage: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  holidayIcon: {
    fontSize: 48,
  },
  holidayTitle: {
    fontSize: typography.heading,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  holidayName: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  removeHolidayButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.danger + "20",
    borderRadius: radii.md,
  },
  removeHolidayText: {
    color: colors.danger,
    fontWeight: "600",
  },
  markHolidayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.accent + "20",
    borderRadius: radii.md,
    alignSelf: "center",
  },
  markHolidayText: {
    color: colors.accent,
    fontWeight: "600",
  },
});
