import { StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing, typography } from "@/constants/theme";

// Placeholder component for the quick attendance modal.
export const AttendanceModal = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Attendance Modal</Text>
    <Text style={styles.subtitle}>Coming soon...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.subheading,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
  },
});
