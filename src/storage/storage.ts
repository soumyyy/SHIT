import AsyncStorage from "@react-native-async-storage/async-storage";

import { STORAGE_KEYS } from "./keys";
import { AttendanceLog, Holiday, SlotOverride, Subject, TimetableSlot } from "@/data/models";

type JsonValue = unknown;

const read = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    await AsyncStorage.removeItem(key);
    return null;
  }
};

const write = async (key: string, value: JsonValue) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const Storage = {
  getSubjects: () => read<Subject[]>(STORAGE_KEYS.subjects),
  saveSubjects: (value: JsonValue) => write(STORAGE_KEYS.subjects, value),
  getSlots: () => read<TimetableSlot[]>(STORAGE_KEYS.slots),
  saveSlots: (value: JsonValue) => write(STORAGE_KEYS.slots, value),
  getAttendanceLogs: () => read<AttendanceLog[]>(STORAGE_KEYS.attendance),
  saveAttendanceLogs: (value: JsonValue) => write(STORAGE_KEYS.attendance, value),
  getSlotOverrides: () => read<SlotOverride[]>(STORAGE_KEYS.slotOverrides),
  saveSlotOverrides: (value: JsonValue) => write(STORAGE_KEYS.slotOverrides, value),
  getHolidays: () => read<Holiday[]>(STORAGE_KEYS.holidays),
  saveHolidays: (value: JsonValue) => write(STORAGE_KEYS.holidays, value),
  getSettings: () => read(STORAGE_KEYS.settings),
  saveSettings: (value: JsonValue) => write(STORAGE_KEYS.settings, value),
  clearAll: async () => {
    await AsyncStorage.multiRemove([...Object.values(STORAGE_KEYS), 'hasLaunchedBefore']);
  },
};
