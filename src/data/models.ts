export type AttendanceStatus = "present" | "absent";

export interface Subject {
  id: string;
  name: string;
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
  slotId?: string;
  status: AttendanceStatus;
  markedAt: string;
}

export interface Settings {
  semesterWeeks: number;
  minAttendance: number;
  semesterStartDate?: string;
  version: number;
}
