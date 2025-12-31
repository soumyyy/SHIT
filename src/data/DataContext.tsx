import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, ActivityIndicator, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { colors, spacing } from "@/constants/theme";
import { AttendanceLog, AttendanceStatus, Settings, SlotOverride, Subject, TimetableSlot } from "@/data/models";
import { mockSlots, mockSubjects } from "@/data/mockData";
import { Storage } from "@/storage/storage";
import { formatLocalDate } from "./helpers";

interface AddSubjectPayload {
  id: string;
  name: string;
  professor?: string;
}

interface AddSlotPayload {
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
}

interface MarkAttendancePayload {
  slotId: string;
  subjectId: string;
  status: AttendanceStatus;
  date?: string;
}

interface DataContextValue {
  subjects: Subject[];
  slots: TimetableSlot[];
  attendanceLogs: AttendanceLog[];
  settings: Settings;
  slotOverrides: SlotOverride[];
  loading: boolean;
  markAttendance: (payload: MarkAttendancePayload) => Promise<void>;
  addSubject: (payload: AddSubjectPayload) => Promise<void>;
  addSlot: (payload: AddSlotPayload) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  addSlotOverride: (override: Omit<SlotOverride, "id">) => Promise<void>;
  importData: (subjects: Subject[], slots: TimetableSlot[]) => Promise<void>;
  updateSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  updateSlot: (slot: TimetableSlot) => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;
  unmarkAttendance: (slotId: string, date?: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [settings, setSettings] = useState<Settings>({
    semesterStartDate: "2026-01-02",
    semesterWeeks: 15,
    minAttendanceThreshold: 0.8,
  });
  const [slotOverrides, setSlotOverrides] = useState<SlotOverride[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [storedSubjects, storedSlots, storedAttendance, storedOverrides, hasLaunched] = await Promise.all([
        Storage.getSubjects(),
        Storage.getSlots(),
        Storage.getAttendanceLogs(),
        Storage.getSlotOverrides(),
        AsyncStorage.getItem('hasLaunchedBefore'),
      ]);

      // Only use mock data on very first launch
      const isFirstLaunch = !hasLaunched;

      const normalizedSubjects: Subject[] = storedSubjects ?? (isFirstLaunch ? mockSubjects : []);
      const normalizedSlots: TimetableSlot[] = storedSlots ?? (isFirstLaunch ? mockSlots : []);
      const normalizedAttendance: AttendanceLog[] = storedAttendance ?? [];
      const normalizedOverrides: SlotOverride[] = storedOverrides ?? [];

      // Save data and mark as launched on first launch
      if (isFirstLaunch) {
        await Promise.all([
          Storage.saveSubjects(normalizedSubjects),
          Storage.saveSlots(normalizedSlots),
          Storage.saveAttendanceLogs(normalizedAttendance),
          Storage.saveSlotOverrides(normalizedOverrides),
          AsyncStorage.setItem('hasLaunchedBefore', 'true'),
        ]);
      }

      setSubjects(normalizedSubjects);
      setSlots(normalizedSlots);
      setAttendanceLogs(normalizedAttendance);
      setSlotOverrides(normalizedOverrides);
    } catch (error) {
      console.error("Failed to load data:", error);
      // If data is corrupted, reset to empty (not mock data)
      try {
        await Storage.saveSubjects([]);
        await Storage.saveSlots([]);
        await Storage.saveAttendanceLogs([]);
        await Storage.saveSlotOverrides([]);
        setSubjects([]);
        setSlots([]);
        setAttendanceLogs([]);
        setSlotOverrides([]);
      } catch (resetError) {
        Alert.alert("Error", "Failed to load data. Please restart the app.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading) {
      Storage.saveSlotOverrides(slotOverrides);
    }
  }, [slotOverrides, loading]);

  const persistSubjects = useCallback(async (next: Subject[]) => {
    setSubjects(next);
    await Storage.saveSubjects(next);
  }, []);

  const persistSlots = useCallback(async (next: TimetableSlot[]) => {
    setSlots(next);
    await Storage.saveSlots(next);
  }, []);

  const persistAttendance = useCallback(async (next: AttendanceLog[]) => {
    setAttendanceLogs(next);
    await Storage.saveAttendanceLogs(next);
  }, []);

  const markAttendance = useCallback(
    async ({ slotId, subjectId, status, date }: MarkAttendancePayload) => {
      const isoDate = date || formatLocalDate(new Date());
      const filtered = attendanceLogs.filter(
        (log) => !(log.slotId === slotId && log.date === isoDate),
      );
      const log: AttendanceLog = {
        id: `${slotId}-${isoDate}`,
        slotId,
        subjectId,
        date: isoDate,
        status,
        markedAt: new Date().toISOString(),
      };
      const next = [...filtered, log];
      await persistAttendance(next);
    },
    [attendanceLogs, persistAttendance],
  );

  const unmarkAttendance = useCallback(
    async (slotId: string, date?: string) => {
      const isoDate = date || formatLocalDate(new Date());
      const next = attendanceLogs.filter(
        (log) => !(log.slotId === slotId && log.date === isoDate),
      );
      await persistAttendance(next);
    },
    [attendanceLogs, persistAttendance],
  );

  const addSubject = useCallback(
    async ({ id, name, professor }: AddSubjectPayload) => {
      const normalizedId = id.trim().toUpperCase();
      const normalizedName = name.trim();

      if (!normalizedId || !normalizedName) {
        throw new Error("Subject code and name are required.");
      }
      if (subjects.some((subject) => subject.id === normalizedId)) {
        throw new Error("A subject with this code already exists.");
      }

      const subject: Subject = {
        id: normalizedId,
        name: normalizedName,
        professor: professor?.trim(),
        createdAt: new Date().toISOString(),
      };

      await persistSubjects([...subjects, subject]);
    },
    [persistSubjects, subjects],
  );

  const addSlot = useCallback(
    async ({ subjectId, dayOfWeek, startTime, endTime, room }: AddSlotPayload) => {
      const subjectExists = subjects.some((subject) => subject.id === subjectId);
      if (!subjectExists) {
        throw new Error("Select a valid subject.");
      }
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        throw new Error("Choose a valid day of week.");
      }
      const isValidTime = (value: string) => /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(value);
      if (!isValidTime(startTime) || !isValidTime(endTime)) {
        throw new Error("Use HH:MM 24h format for time.");
      }
      const startMinutes = parseInt(startTime.slice(0, 2), 10) * 60 + parseInt(startTime.slice(3), 10);
      const endMinutes = parseInt(endTime.slice(0, 2), 10) * 60 + parseInt(endTime.slice(3), 10);
      if (endMinutes <= startMinutes) {
        throw new Error("End time must be after start time.");
      }

      const slot: TimetableSlot = {
        id: `${subjectId}-${dayOfWeek}-${startTime.replace(":", "")}`,
        subjectId,
        dayOfWeek,
        startTime,
        durationMinutes: endMinutes - startMinutes,
        room: room?.trim() ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await persistSlots([...slots, slot]);
    },
    [persistSlots, slots, subjects],
  );



  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await Storage.saveSettings(updated);
  }, [settings]);

  const addSlotOverride = useCallback(async (override: Omit<SlotOverride, "id">) => {
    const newOverride: SlotOverride = {
      ...override,
      id: Date.now().toString(),
    };
    setSlotOverrides((prev) => [...prev, newOverride]);
  }, []);

  const importData = useCallback(async (newSubjects: Subject[], newSlots: TimetableSlot[]) => {
    await persistSubjects(newSubjects);
    await persistSlots(newSlots);
  }, [persistSubjects, persistSlots]);

  const updateSubject = useCallback(async (updatedSubject: Subject) => {
    const next = subjects.map((s) => (s.id === updatedSubject.id ? updatedSubject : s));
    await persistSubjects(next);
  }, [persistSubjects, subjects]);

  const deleteSubject = useCallback(async (id: string) => {
    const next = subjects.filter(s => s.id !== id);
    await persistSubjects(next);
  }, [persistSubjects, subjects]);

  const updateSlot = useCallback(async (updatedSlot: TimetableSlot) => {
    const next = slots.map((s) => (s.id === updatedSlot.id ? updatedSlot : s));
    await persistSlots(next);
  }, [persistSlots, slots]);

  const deleteSlot = useCallback(async (id: string) => {
    const next = slots.filter(s => s.id !== id);
    await persistSlots(next);
  }, [persistSlots, slots]);

  const value = useMemo<DataContextValue>(
    () => ({
      subjects,
      slots,
      attendanceLogs,
      settings,
      slotOverrides,
      loading,
      markAttendance,
      addSubject,
      addSlot,
      updateSettings,
      addSlotOverride,
      importData,
      updateSubject,
      deleteSubject,
      updateSlot,
      deleteSlot,
      unmarkAttendance,
      refresh: load,
    }),
    [subjects, slots, attendanceLogs, settings, slotOverrides, loading, markAttendance, addSubject, addSlot, updateSettings, addSlotOverride, importData, load, updateSubject, deleteSubject, unmarkAttendance],
  );

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextValue => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
});
