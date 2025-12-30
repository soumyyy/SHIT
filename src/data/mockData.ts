import subjectsSeed from "./subjects.json";
import slotsSeed from "./slots.json";

import { AttendanceLog, Subject, TimetableSlot } from "./models";

const now = new Date().toISOString();

type SubjectSeed = {
  id: string;
  name: string;
  professor?: string;
  defaultRoom?: string;
};

type SlotSeed = {
  id: string;
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  room?: string;
};

const parseTimeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

const getDuration = (slot: SlotSeed) => {
  if (typeof slot.durationMinutes === "number") {
    return slot.durationMinutes;
  }
  if (slot.endTime) {
    const start = parseTimeToMinutes(slot.startTime);
    const end = parseTimeToMinutes(slot.endTime);
    const diff = end - start;
    return diff > 0 ? diff : 60;
  }
  return 60;
};

export const mockSubjects: Subject[] = (subjectsSeed as SubjectSeed[]).map((subject) => ({
  id: subject.id,
  name: subject.name,
  professor: subject.professor,
  defaultRoom: subject.defaultRoom,
  createdAt: now,
}));

export const mockSlots: TimetableSlot[] = (slotsSeed as SlotSeed[]).map((slot) => ({
  id: slot.id,
  subjectId: slot.subjectId,
  dayOfWeek: slot.dayOfWeek,
  startTime: slot.startTime,
  durationMinutes: getDuration(slot),
  room: slot.room ?? "",
  createdAt: now,
  updatedAt: now,
}));

export const mockAttendanceLogs: AttendanceLog[] = [];
