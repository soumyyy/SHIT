import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/constants/theme";

interface DaySectionProps {
  title: string;
  children: ReactNode;
}

export const DaySection = ({ title, children }: DaySectionProps) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.divider} />
    </View>
    <View style={styles.body}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "700",
    marginRight: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  body: {
    marginTop: spacing.sm,
  },
});
