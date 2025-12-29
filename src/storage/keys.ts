export const STORAGE_KEYS = {
  subjects: "@shit/subjects",
  slots: "@shit/slots",
  attendance: "@shit/attendance",
  settings: "@shit/settings",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
