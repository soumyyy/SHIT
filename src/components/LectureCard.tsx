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
        <View style={styles.titleColumn}>
          <Text style={styles.title}>
            {title}
            {room ? <Text style={styles.roomInline}> • {room}</Text> : null}
          </Text>
        </View>
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
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
  right: {
    marginLeft: spacing.md,
  },
});
