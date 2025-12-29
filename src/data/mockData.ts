import subjectsSeed from "./subjects.json";
import slotsSeed from "./slots.json";

import { AttendanceLog, Subject, TimetableSlot } from "./models";

const now = new Date().toISOString();

type SubjectSeed = {
  id: string;
  name: string;
  defaultRoom?: string;
};

type SlotSeed = {
  id: string;
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  durationMinutes?: number;
  room?: string;
};

export const mockSubjects: Subject[] = (subjectsSeed as SubjectSeed[]).map((subject) => ({
  id: subject.id,
  name: subject.name,
  defaultRoom: subject.defaultRoom,
  createdAt: now,
}));

export const mockSlots: TimetableSlot[] = (slotsSeed as SlotSeed[]).map((slot) => ({
  id: slot.id,
  subjectId: slot.subjectId,
  dayOfWeek: slot.dayOfWeek,
  startTime: slot.startTime,
  durationMinutes: slot.durationMinutes ?? 60,
  room: slot.room ?? "",
  createdAt: now,
  updatedAt: now,
}));

export const mockAttendanceLogs: AttendanceLog[] = [
  {
    id: "log-ai-1",
    date: "2024-07-01",
    subjectId: "AI",
    slotId: "mon-ai-1",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-ai-2",
    date: "2024-07-03",
    subjectId: "AI",
    slotId: "mon-ai-1",
    status: "absent",
    markedAt: now,
  },
  {
    id: "log-fm-1",
    date: "2024-07-05",
    subjectId: "FM",
    slotId: "mon-fm",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-atsa-1",
    date: "2024-07-08",
    subjectId: "ATSA",
    slotId: "fri-atsa-lab",
    status: "absent",
    markedAt: now,
  },
  {
    id: "log-gai-1",
    date: "2024-07-08",
    subjectId: "GAI",
    slotId: "tue-gai",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-ba-1",
    date: "2024-07-09",
    subjectId: "BA",
    slotId: "fri-ba",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-psb-1",
    date: "2024-07-10",
    subjectId: "PSB",
    slotId: "wed-psb",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-cap-1",
    date: "2024-07-11",
    subjectId: "CAP",
    slotId: "thu-cap",
    status: "present",
    markedAt: now,
  },
];
