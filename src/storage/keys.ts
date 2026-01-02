export const STORAGE_KEYS = {
  subjects: "@shit/subjects",
  slots: "@shit/slots",
  attendance: "@shit/attendance",
  settings: "@shit/settings",
  slotOverrides: "@shit/slotOverrides",
  holidays: "@shit/holidays",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
