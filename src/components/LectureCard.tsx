import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  onDelete?: () => void;
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
  onDelete,
}: LectureCardProps) => (
  <Pressable
    onPress={onPress}
    onLongPress={onLongPress}
    style={({ pressed }) => [styles.container, pressed && styles.pressed]}
  >
    <View style={styles.content}>
      <View style={styles.leftColumn}>
        <Text style={styles.title}>
          {title}
          {room ? <Text style={styles.roomInline}> • {room}</Text> : null}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rightColumn}>
        {status ? (
          <View style={[styles.statusBadge, { borderColor: STATUS_COLORS[status] }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[status] }]}>
              {STATUS_TEXT[status]}
            </Text>
          </View>
        ) : null}
        {onDelete && status ? (
          <Pressable onPress={onDelete} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        ) : null}
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  leftColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  rightColumn: {
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
    paddingTop: spacing.xs + 1,
    paddingBottom: spacing.xs - 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontWeight: "700",
    fontSize: typography.small,
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  right: {
    marginLeft: spacing.md,
  },
});
