import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View, LayoutChangeEvent, PanResponder } from "react-native";

import { colors, radii, spacing } from "@/constants/theme";

export const GlassTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = 50;

        // Swipe left (go to next tab)
        if (gestureState.dx < -swipeThreshold && state.index < state.routes.length - 1) {
          const nextRoute = state.routes[state.index + 1];
          navigation.navigate(nextRoute.name);
        }
        // Swipe right (go to previous tab)
        else if (gestureState.dx > swipeThreshold && state.index > 0) {
          const prevRoute = state.routes[state.index - 1];
          navigation.navigate(prevRoute.name);
        }
      },
    })
  ).current;

  useEffect(() => {
    if (tabLayouts.length > 0 && tabLayouts[state.index]) {
      Animated.spring(slideAnim, {
        toValue: tabLayouts[state.index].x,
        useNativeDriver: true,
        damping: 20,
        mass: 0.8,
        stiffness: 150,
      }).start();
    }
  }, [state.index, tabLayouts]);

  const handleTabLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => {
      const updated = [...prev];
      updated[index] = { x, width };
      return updated;
    });
  };

  return (
    <View pointerEvents="box-none" style={styles.wrapper} {...panResponder.panHandlers}>
      <BlurView intensity={50} tint="light" style={styles.container}>
        <View style={styles.tabContainer}>
          {/* Animated sliding background pill */}
          {tabLayouts.length > 0 && tabLayouts[state.index] && (
            <Animated.View
              style={[
                styles.activePill,
                {
                  width: tabLayouts[state.index].width,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            />
          )}

          {/* Tab buttons */}
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLayout={handleTabLayout(index)}
                style={styles.tab}
              >
                <Text style={[styles.tabText, isFocused && styles.tabTextActive]}>
                  {typeof label === "string" ? label : "Tab"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingBottom: spacing.lg + 10,
  },
  container: {
    width: "85%", // Slightly wider
    maxWidth: 380,
    borderRadius: radii.pill,
    overflow: "hidden",
    // Refined Light Wine Tint
    backgroundColor: "rgba(114, 47, 55, 0.02)",
    // borderColor: "rgba(114, 47, 55, 0.1)",
    // borderWidth: 1,
    shadowColor: "#2A1A1F",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 10,
  },
  tabContainer: {
    flexDirection: "row",
    position: "relative",
    padding: 4, // Critical 4px track gap
  },
  activePill: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: radii.pill,
    top: 4, // Match padding
    bottom: 4,
    shadowColor: "#722F37",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.pill,
    zIndex: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "rgba(114, 47, 55, 0.6)", // Muted wine for inactive
  },
  tabTextActive: {
    color: "#722F37", // Strong wine for active
    fontWeight: "700",
  },
});
