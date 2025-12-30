import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, shadows, spacing, typography } from "@/constants/theme";

interface SubjectRowProps {
  title: string;
  percentage: number;
  present: number;
  total: number;
  safeToMiss: number; // can be negative if already below threshold
  minAttendance: number;
  onPress?: () => void;
}

export const SubjectRow = ({ title, percentage, present, total, safeToMiss, minAttendance, onPress }: SubjectRowProps) => {
  const pct = Math.max(0, Math.min(percentage, 100));
  const isBelow = pct < minAttendance * 100;

  return (
    <Pressable style={({ pressed }) => [styles.container, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.content}>
        {/* Header: Title + Badge */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={[styles.badge, isBelow ? styles.badgeDanger : styles.badgeSuccess]}>
            <Text style={[styles.badgeText, isBelow ? styles.badgeTextDanger : styles.badgeTextSuccess]}>
              {pct.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Footer: Counts + Can Miss */}
        <View style={styles.footer}>
          <Text style={styles.statsText}>
            <Text style={styles.statsValue}>{present}</Text>/{total} attended
          </Text>

          <View>
            {safeToMiss >= 0 ? (
              <Text style={styles.safeText}>Can miss {safeToMiss}</Text>
            ) : (
              <Text style={styles.dangerText}>Over limit by {Math.abs(safeToMiss)}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Progress Bar (Absolute Bottom) */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            isBelow ? styles.progressFillDanger : styles.progressFillSuccess,
            { width: `${pct}%` },
          ]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.md, // Reduced radius
    marginBottom: spacing.sm, // Reduced margin
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.soft,
    overflow: 'hidden', // Ensure progress bar clips
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.lg, // Make space for footer text but bar is absolute
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs, // Tighter spacing
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: colors.success + '15',
    borderColor: colors.success,
  },
  badgeDanger: {
    backgroundColor: colors.danger + '15',
    borderColor: colors.danger,
  },
  badgeText: {
    fontSize: typography.tiny,
    fontWeight: "700",
  },
  badgeTextSuccess: { color: colors.success },
  badgeTextDanger: { color: colors.danger },

  // Progress Bar moved to bottom
  progressTrack: {
    height: 4,
    backgroundColor: colors.card,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  progressFill: {
    height: "100%",
  },
  progressFillSuccess: { backgroundColor: colors.accent },
  progressFillDanger: { backgroundColor: colors.danger },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statsText: {
    color: colors.textSecondary,
    fontSize: typography.tiny,
  },
  statsValue: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  safeText: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: "600",
  },
  dangerText: {
    color: colors.danger,
    fontSize: typography.tiny,
    fontWeight: "700",
  },
});
