import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, View } from "react-native";

import { colors, radii, shadows, spacing } from "@/constants/theme";

export const GlassTabBar = (props: BottomTabBarProps) => (
  <View pointerEvents="box-none" style={styles.wrapper}>
    <View style={styles.container}>
      <BottomTabBar {...props} style={styles.tabBar} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  container: {
    borderRadius: 32,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.soft,
  },
  tabBar: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: 72,
    paddingHorizontal: spacing.lg,
  },
});
