import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, shadows, spacing, typography } from "@/constants/theme";

interface LectureCardProps {
  title: string;
  subtitle?: string;
  room?: string;
  rightElement?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const LectureCard = ({
  title,
  subtitle,
  room,
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
        <Text style={styles.title}>{title}</Text>
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {room ? (
        <View style={styles.roomPill}>
          <Text style={styles.roomLabel}>{room}</Text>
        </View>
      ) : null}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.soft,
  },
  pressed: {
    transform: [{ scale: 0.995 }],
    opacity: 0.9,
  },
  content: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  right: {
    marginLeft: spacing.md,
  },
  roomPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.cardMuted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  roomLabel: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
