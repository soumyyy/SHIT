import { StatusBar } from "expo-status-bar";

import { DataProvider } from "@/data/DataContext";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useAutoAttendance } from "@/hooks/useAutoAttendance";

function AppContent() {
  useAutoAttendance();

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
