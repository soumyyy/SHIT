import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, shadows, spacing, typography } from "@/constants/theme";
import { getDayLabel } from "@/data/helpers";
import { Subject, TimetableSlot } from "@/data/models";

const DAY_INDEXES = [0, 1, 2, 3, 4, 5];
const START_HOUR = 9;
const END_HOUR = 18; // exclusive
const HOUR_BLOCKS = END_HOUR - START_HOUR;

interface TimetableGridProps {
  slots: TimetableSlot[];
  subjects: Subject[];
}

type SlotCell = {
  slot: TimetableSlot;
  isStart: boolean;
};

export const TimetableGrid = ({ slots, subjects }: TimetableGridProps) => {
  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const cellsByDay = useMemo(() => {
    const map = new Map<number, Array<SlotCell | null>>();
    DAY_INDEXES.forEach((day) => {
      map.set(day, Array<SlotCell | null>(HOUR_BLOCKS).fill(null));
    });

    DAY_INDEXES.forEach((day) => {
      const cells = map.get(day);
      if (!cells) return;
      const daySlots = slots
        .filter((slot) => slot.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      daySlots.forEach((slot) => {
        const [startHour] = slot.startTime.split(":").map(Number);
        const startIndex = Math.max(0, Math.min(HOUR_BLOCKS - 1, Math.floor(startHour - START_HOUR)));
        const span = Math.max(1, Math.ceil(slot.durationMinutes / 60));
        for (let i = 0; i < span; i++) {
          const idx = startIndex + i;
          if (idx >= 0 && idx < HOUR_BLOCKS) {
            cells[idx] = { slot, isStart: i === 0 };
          }
        }
      });
    });

    return map;
  }, [slots]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.rotated}>
        <View style={styles.gridCard}>
          <View style={styles.headerRow}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeHeaderLabel}>Time</Text>
            </View>
            {DAY_INDEXES.map((day) => (
              <Text key={day} style={styles.dayLabel}>
                {getDayLabel(day)}
              </Text>
            ))}
          </View>
          <View style={styles.body}>
            {Array.from({ length: HOUR_BLOCKS }).map((_, rowIndex) => {
              const start = START_HOUR + rowIndex;
              const end = start + 1;
              return (
                <View key={rowIndex} style={styles.row}>
                  <View style={styles.timeCell}>
                    <Text style={styles.timeLabel}>
                      {start}
                      <Text style={styles.timeLabelSuffix}>–{end}</Text>
                    </Text>
                  </View>
                  {DAY_INDEXES.map((day) => {
                  const cell = cellsByDay.get(day)?.[rowIndex] ?? null;
                  return (
                    <View
                      key={`${day}-${rowIndex}`}
                      style={[
                        styles.cell,
                        cell && styles.cellFilled,
                        cell && !cell.isStart && styles.cellContinuation,
                      ]}
                    >
                      {cell?.isStart ? (
                        <>
                          <Text style={styles.subjectCode}>
                            {subjectMap.get(cell.slot.subjectId)?.id ?? cell.slot.subjectId}
                          </Text>
                          <Text style={styles.room}>{cell.slot.room}</Text>
                        </>
                      ) : null}
                    </View>
                  );
                })}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  rotated: {
    transform: [{ rotate: "90deg" }],
  },
  gridCard: {
    width: 620,
    height: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    ...shadows.medium,
  },
  timeHeader: {
    width: 70,
  },
  timeHeaderLabel: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  dayLabel: {
    color: colors.textPrimary,
    fontSize: typography.small,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  body: {
    flex: 1,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.backgroundSecondary,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  timeCell: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  timeLabel: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "600",
  },
  timeLabelSuffix: {
    fontSize: typography.tiny,
  },
  cell: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.borderStrong,
    backgroundColor: colors.cardMuted,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 42,
  },
  cellFilled: {
    backgroundColor: colors.card,
  },
  cellContinuation: {
    borderTopWidth: 0,
  },
  subjectCode: {
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: typography.body,
  },
  room: {
    color: colors.textSecondary,
    fontSize: typography.tiny - 1,
    marginTop: spacing.xs / 2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
