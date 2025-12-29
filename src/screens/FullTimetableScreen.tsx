import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TimetableGrid } from "@/components/TimetableGrid";
import { colors, spacing } from "@/constants/theme";
import { mockSlots, mockSubjects } from "@/data/mockData";

export const FullTimetableScreen = () => (
  <SafeAreaView style={styles.safeArea} edges={["top"]}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TimetableGrid slots={mockSlots} subjects={mockSubjects} />
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.xl * 4,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
