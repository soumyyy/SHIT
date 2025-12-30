import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radii, shadows, spacing, typography } from "@/constants/theme";
import { getDayLabel } from "@/data/helpers";
import { Subject, TimetableSlot } from "@/data/models";

const DAY_INDEXES = [0, 1, 2, 3, 4, 5];
const START_HOUR = 9;
const END_HOUR = 18; // exclusive
const HOUR_BLOCKS = END_HOUR - START_HOUR;
const ROW_HEIGHT = 40;

interface TimetableGridProps {
  slots: TimetableSlot[];
  subjects: Subject[];
}

type DayBlock =
  | { type: "gap"; span: number }
  | { type: "slot"; span: number; slot: TimetableSlot };

const hourLabels = Array.from({ length: HOUR_BLOCKS }).map((_, idx) => {
  const start = START_HOUR + idx;
  const end = start + 1;
  return `${start}–${end}`;
});

export const TimetableGrid = ({ slots, subjects }: TimetableGridProps) => {
  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  const dayColumns = useMemo(() => {
    return DAY_INDEXES.map((day) => {
      const sorted = slots
        .filter((slot) => slot.dayOfWeek === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      const blocks: DayBlock[] = [];
      let cursor = START_HOUR;

      sorted.forEach((slot) => {
        const [startHour] = slot.startTime.split(":").map(Number);
        const normalizedStart = Math.max(START_HOUR, Math.min(END_HOUR, startHour));

        if (normalizedStart > cursor) {
          blocks.push({ type: "gap", span: normalizedStart - cursor });
        }

        const span = Math.max(1, Math.ceil(slot.durationMinutes / 60));
        const clampedSpan = Math.min(span, END_HOUR - normalizedStart);
        if (clampedSpan > 0) {
          blocks.push({ type: "slot", span: clampedSpan, slot });
          cursor = normalizedStart + clampedSpan;
        }
      });

      if (cursor < END_HOUR) {
        blocks.push({ type: "gap", span: END_HOUR - cursor });
      }

      return { day, blocks };
    });
  }, [slots]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.rotated}>
        <View style={styles.card}>
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
            <View style={styles.timeColumn}>
              {hourLabels.map((label) => (
                <View key={label} style={styles.timeRow}>
                  <Text style={styles.timeLabel}>{label}</Text>
                </View>
              ))}
            </View>

            {dayColumns.map(({ day, blocks }) => (
              <View key={day} style={styles.dayColumn}>
                {blocks.map((block, index) =>
                  block.type === "gap" ? (
                    <View
                      key={`${day}-gap-${index}`}
                      style={[styles.gapBlock, { height: ROW_HEIGHT * block.span }]}
                    />
                  ) : (
                    <View
                      key={`${day}-${block.slot.id}-${index}`}
                      style={[styles.slotBlock, { height: ROW_HEIGHT * block.span }]}
                    >
                      <Text style={styles.subjectCode}>
                        {subjectMap.get(block.slot.subjectId)?.id ?? block.slot.subjectId}
                      </Text>
                      <Text style={styles.room}>{block.slot.room}</Text>
                    </View>
                  ),
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl + spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  rotated: {
    transform: [{ rotate: "90deg" }],
  },
  card: {
    width: 580,
    height: 400,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.sm,
    ...shadows.medium,
  },
  headerRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  timeHeader: {
    width: 64,
  },
  timeHeaderLabel: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  dayLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.small,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    flexDirection: "row",
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    overflow: "hidden",
    backgroundColor: colors.backgroundSecondary,
  },
  timeColumn: {
    width: 64,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  timeRow: {
    height: ROW_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  timeLabel: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "600",
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.borderStrong,
    backgroundColor: colors.cardMuted,
  },
  gapBlock: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  slotBlock: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  subjectCode: {
    color: colors.textPrimary,
    fontWeight: "800",
    fontSize: typography.small,
  },
  room: {
    color: colors.textSecondary,
    fontSize: typography.tiny - 2,
    marginTop: spacing.xs / 2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
