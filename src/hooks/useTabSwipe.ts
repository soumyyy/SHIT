import { useMemo } from "react";
import { PanResponder } from "react-native";
import { NavigationProp } from "@react-navigation/native";

type Tabs = "TimetableTab" | "AttendanceTab";

const SWIPE_THRESHOLD = 40;

export const useTabSwipe = (navigation: NavigationProp<any>, currentTab: Tabs) => {
  return useMemo(() => {
    const parent = navigation.getParent();
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 20 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderRelease: (_, gesture) => {
        if (!parent) return;
        if (gesture.dx < -SWIPE_THRESHOLD && currentTab === "TimetableTab") {
          parent.navigate("AttendanceTab");
        } else if (gesture.dx > SWIPE_THRESHOLD && currentTab === "AttendanceTab") {
          parent.navigate("TimetableTab");
        }
      },
    });
  }, [navigation, currentTab]);
};
