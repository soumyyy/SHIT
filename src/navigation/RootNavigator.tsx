import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { enableScreens } from "react-native-screens";

import { colors, radii, shadows, spacing } from "@/constants/theme";
import { AttendanceScreen } from "@/screens/AttendanceScreen";
import { FullTimetableScreen } from "@/screens/FullTimetableScreen";
import { SubjectOverviewScreen } from "@/screens/SubjectOverviewScreen";
import { TimetableTodayScreen } from "@/screens/TimetableTodayScreen";

import { GlassTabBar } from "./GlassTabBar";
import { RootTabParamList, TimetableStackParamList } from "./types";

enableScreens();

const Tab = createBottomTabNavigator<RootTabParamList>();
const TimetableStack = createNativeStackNavigator<TimetableStackParamList>();

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

const TabLabel = ({ title, focused }: { title: string; focused: boolean }) => (
  <View style={[tabStyles.labelContainer, focused && tabStyles.labelContainerActive]}>
    <Text style={[tabStyles.labelText, focused && tabStyles.labelTextActive]}>{title}</Text>
  </View>
);

export const RootNavigator = () => (
  <NavigationContainer theme={navigationTheme}>
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.container,
        tabBarItemStyle: tabStyles.item,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="TimetableTab"
        component={TimetableStackNavigator}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel title="Timetable" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={AttendanceScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel title="Attendance" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  </NavigationContainer>
);

const tabStyles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
  },
  item: {
    borderRadius: radii.pill,
  },
  labelContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: "transparent",
  },
  labelContainerActive: {
    backgroundColor: colors.glassBorder,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.textSecondary,
  },
  labelTextActive: {
    color: colors.accent,
  },
});
