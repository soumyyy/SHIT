import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";

import { colors, radii, shadows, spacing } from "@/constants/theme";

export const GlassTabBar = (props: BottomTabBarProps) => (
  <View pointerEvents="box-none" style={styles.wrapper}>
    <BlurView intensity={40} tint="light" style={styles.container}>
      <BottomTabBar {...props} style={styles.tabBar} />
    </BlurView>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  container: {
    borderRadius: 24,
    overflow: "hidden",
    ...shadows.soft,
  },
  tabBar: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: 60,
    paddingHorizontal: spacing.lg,
  },
});
