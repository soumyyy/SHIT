import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, ActivityIndicator, View, StyleSheet } from "react-native";

import { colors, spacing } from "@/constants/theme";
import { AttendanceLog, AttendanceStatus, Settings, SlotOverride, Subject, TimetableSlot } from "@/data/models";
import { mockSlots, mockSubjects } from "@/data/mockData";
import { Storage } from "@/storage/storage";

interface AddSubjectPayload {
  id: string;
  name: string;
  professor?: string;
  defaultRoom?: string;
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
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const formatDate = (value?: string) => {
  if (value) {
    return value;
  }
  return new Date().toISOString().split("T")[0];
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [settings, setSettings] = useState<Settings>({
    semesterStartDate: "2026-01-02",
    semesterEndDate: "2026-05-30",
    minAttendanceThreshold: 0.8,
  });
  const [slotOverrides, setSlotOverrides] = useState<SlotOverride[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [storedSubjects, storedSlots, storedAttendance, storedOverrides] = await Promise.all([
        Storage.getSubjects(),
        Storage.getSlots(),
        Storage.getAttendanceLogs(),
        Storage.getSlotOverrides(),
      ]);

      const normalizedSubjects: Subject[] = storedSubjects ?? mockSubjects;
      const normalizedSlots: TimetableSlot[] = storedSlots ?? mockSlots;
      const normalizedAttendance: AttendanceLog[] = storedAttendance ?? [];
      const normalizedOverrides: SlotOverride[] = storedOverrides ?? [];

      if (!storedSubjects) {
        await Storage.saveSubjects(normalizedSubjects);
      }
      if (!storedSlots) {
        await Storage.saveSlots(normalizedSlots);
      }
      if (!storedAttendance) {
        await Storage.saveAttendanceLogs(normalizedAttendance);
      }
      if (!storedOverrides) {
        await Storage.saveSlotOverrides(normalizedOverrides);
      }

      setSubjects(normalizedSubjects);
      setSlots(normalizedSlots);
      setAttendanceLogs(normalizedAttendance);
      setSlotOverrides(normalizedOverrides);
    } catch (error) {
      console.error("Failed to load data:", error);
      // If data is corrupted, reset to mock data
      try {
        await Storage.saveSubjects(mockSubjects);
        await Storage.saveSlots(mockSlots);
        await Storage.saveAttendanceLogs([]);
        await Storage.saveSlotOverrides([]);
        setSubjects(mockSubjects);
        setSlots(mockSlots);
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
      const isoDate = formatDate(date);
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

  const addSubject = useCallback(
    async ({ id, name, professor, defaultRoom }: AddSubjectPayload) => {
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
        defaultRoom: defaultRoom?.trim(),
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
    // TODO: Persist to AsyncStorage
  }, [settings]);

  const addSlotOverride = useCallback(async (override: Omit<SlotOverride, "id">) => {
    const newOverride: SlotOverride = {
      ...override,
      id: Date.now().toString(),
    };
    setSlotOverrides((prev) => [...prev, newOverride]);
  }, []);

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
      refresh: load,
    }),
    [subjects, slots, attendanceLogs, settings, slotOverrides, loading, markAttendance, addSubject, addSlot, updateSettings, addSlotOverride, load],
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
