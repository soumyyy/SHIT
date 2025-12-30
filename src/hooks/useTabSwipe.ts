import { useMemo, useRef } from "react";
import { GestureResponderEvent } from "react-native";
import { NavigationProp } from "@react-navigation/native";

type Tabs = "TimetableTab" | "AttendanceTab";

const SWIPE_THRESHOLD = 80;

interface SwipeHandlers {
  onTouchStart: (e: GestureResponderEvent) => void;
  onTouchEnd: (e: GestureResponderEvent) => void;
}

export const useTabSwipe = (
  navigation: NavigationProp<any>,
  currentTab: Tabs
): SwipeHandlers => {
  const startX = useRef(0);

  return useMemo(() => {
    const parent = navigation.getParent();

    return {
      onTouchStart: (e: GestureResponderEvent) => {
        startX.current = e.nativeEvent.pageX;
      },
      onTouchEnd: (e: GestureResponderEvent) => {
        if (!parent) return;
        const endX = e.nativeEvent.pageX;
        const deltaX = endX - startX.current;

        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
          if (deltaX < 0 && currentTab === "TimetableTab") {
            // Swipe left - go to Attendance
            parent.navigate("AttendanceTab");
          } else if (deltaX > 0 && currentTab === "AttendanceTab") {
            // Swipe right - go to Timetable
            parent.navigate("TimetableTab");
          }
        }
      },
    };
  }, [navigation, currentTab]);
};
