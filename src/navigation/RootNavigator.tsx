import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from "react-native-screens";

import { colors } from "@/constants/theme";
import { AttendanceScreen } from "@/screens/AttendanceScreen";
import { FullTimetableScreen } from "@/screens/FullTimetableScreen";
import { SubjectOverviewScreen } from "@/screens/SubjectOverviewScreen";
import { SubjectAttendanceScreen } from "@/screens/SubjectAttendanceScreen";
import { TimetableTodayScreen } from "@/screens/TimetableTodayScreen";

import { GlassTabBar } from "./GlassTabBar";
import { AttendanceStackParamList, RootTabParamList, TimetableStackParamList } from "./types";

enableScreens();

const Tab = createBottomTabNavigator<RootTabParamList>();
const TimetableStack = createNativeStackNavigator<TimetableStackParamList>();
const AttendanceStack = createNativeStackNavigator<AttendanceStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.card,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

const TimetableStackNavigator = () => (
  <TimetableStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.textPrimary },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <TimetableStack.Screen
      name="TimetableToday"
      component={TimetableTodayScreen}
      options={{ title: "Today" }}
    />
    <TimetableStack.Screen
      name="FullTimetable"
      component={FullTimetableScreen}
      options={{ title: "Full Timetable" }}
    />
    <TimetableStack.Screen
      name="SubjectOverview"
      component={SubjectOverviewScreen}
      options={{ title: "Subject Overview" }}
    />
  </TimetableStack.Navigator>
);

const AttendanceStackNavigator = () => (
  <AttendanceStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.textPrimary },
      headerTintColor: colors.textPrimary,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <AttendanceStack.Screen
      name="AttendanceList"
      component={AttendanceScreen}
      options={{ headerShown: false }}
    />
    <AttendanceStack.Screen
      name="SubjectAttendance"
      component={SubjectAttendanceScreen}
      options={{ title: "Attendance Details" }}
    />
  </AttendanceStack.Navigator>
);

export const RootNavigator = () => (
  <NavigationContainer theme={navigationTheme}>
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="TimetableTab"
        component={TimetableStackNavigator}
        options={{
          tabBarLabel: "Timetable",
        }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={AttendanceStackNavigator}
        options={{
          tabBarLabel: "Attendance",
        }}
      />
    </Tab.Navigator>
  </NavigationContainer>
);


