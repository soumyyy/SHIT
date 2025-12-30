export type AttendanceStatus = "present" | "absent";

export interface Subject {
  id: string;
  name: string;
  professor?: string;
  defaultRoom?: string;
  createdAt: string;
}

export interface TimetableSlot {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0 = Monday
  startTime: string; // HH:MM
  durationMinutes: number;
  room: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceLog {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  slotId: string;
  status: AttendanceStatus;
  markedAt: string; // ISO timestamp
}

export interface Settings {
  semesterStartDate: string; // YYYY-MM-DD
  semesterEndDate?: string; // YYYY-MM-DD
  minAttendanceThreshold: number; // 0.0 to 1.0 (e.g., 0.8 for 80%)
}

export interface SlotOverride {
  id: string;
  originalSlotId?: string; // Optional for "added" type
  date: string; // YYYY-MM-DD - specific date for this override
  type: "cancelled" | "modified" | "added";

  // For modified/added classes:
  subjectId?: string;
  startTime?: string;
  durationMinutes?: number;
  room?: string;
  reason?: string;
}
