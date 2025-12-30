import { StatusBar } from "expo-status-bar";

import { DataProvider } from "@/data/DataContext";
import { RootNavigator } from "@/navigation/RootNavigator";

export default function App() {
  return (
    <DataProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </DataProvider>
  );
}
