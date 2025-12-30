import { StyleSheet, Text, View } from "react-native";

import { colors, radii, shadows, spacing, typography } from "@/constants/theme";

interface SubjectRowProps {
  title: string;
  subtitle?: string;
  percentage?: number;
  highlight?: boolean;
}

export const SubjectRow = ({ title, subtitle, percentage, highlight }: SubjectRowProps) => {
  const pct = Math.max(0, Math.min(percentage ?? 0, 100));

  return (
    <View style={[styles.container, highlight && styles.highlight]}>
      <View style={styles.header}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {percentage !== undefined ? (
          <View style={[styles.badge, highlight && styles.badgeDanger]}>
            <Text style={[styles.badgeText, highlight && styles.badgeTextDanger]}>
              {pct.toFixed(0)}%
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            highlight && styles.progressFillDanger,
            { width: `${pct}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingTop: spacing.sm,
    paddingBottom: 0,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.soft,
  },
  highlight: {
    borderColor: colors.danger,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.small,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  badge: {
    backgroundColor: colors.cardMuted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeDanger: {
    backgroundColor: colors.danger,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: typography.small,
    fontWeight: "700",
  },
  badgeTextDanger: {
    color: "#FFF",
  },
  progressTrack: {
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  progressFillDanger: {
    backgroundColor: colors.danger,
  },
});
