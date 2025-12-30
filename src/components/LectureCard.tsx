import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, shadows, spacing, typography } from "@/constants/theme";

export type LectureStatus = "present" | "absent" | null;

interface LectureCardProps {
  title: string;
  subtitle?: string;
  room?: string;
  status?: LectureStatus;
  rightElement?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
}

const STATUS_COLORS: Record<Exclude<LectureStatus, null>, string> = {
  present: colors.accent,
  absent: colors.danger,
};

const STATUS_TEXT: Record<Exclude<LectureStatus, null>, string> = {
  present: "P",
  absent: "A",
};

export const LectureCard = ({
  title,
  subtitle,
  room,
  status = null,
  rightElement,
  onPress,
  onLongPress,
}: LectureCardProps) => (
  <Pressable
    onPress={onPress}
    onLongPress={onLongPress}
    style={({ pressed }) => [styles.container, pressed && styles.pressed]}
  >
    <View style={styles.content}>
      <View style={styles.titleRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.title}>
            {title}
            {room ? <Text style={styles.roomInline}> • {room}</Text> : null}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          {status ? (
            <View style={[styles.statusBadge, { borderColor: STATUS_COLORS[status] }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>
                {STATUS_TEXT[status]}
              </Text>
            </View>
          ) : null}
          {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
        </View>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.soft,
  },
  pressed: {
    transform: [{ scale: 0.995 }],
    opacity: 0.9,
  },
  content: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  titleColumn: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
  },
  roomInline: {
    color: colors.textSecondary,
    fontSize: typography.tiny,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.small,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusText: {
    fontWeight: "700",
    fontSize: typography.small,
  },
  right: {
    marginLeft: spacing.md,
  },
});
