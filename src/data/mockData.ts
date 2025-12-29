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

export const mockAttendanceLogs: AttendanceLog[] = [
  {
    id: "log-mon-atsa",
    date: "2024-07-01",
    subjectId: "ATSA",
    slotId: "mon-atsa-1000",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-mon-fm",
    date: "2024-07-02",
    subjectId: "FM",
    slotId: "mon-fm-1100",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-tue-gai",
    date: "2024-07-08",
    subjectId: "GAI",
    slotId: "tue-gai-1000",
    status: "absent",
    markedAt: now,
  },
  {
    id: "log-thu-b2b",
    date: "2024-07-11",
    subjectId: "B2B",
    slotId: "thu-b2b-1400",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-fri-atsa-pr",
    date: "2024-07-12",
    subjectId: "ATSA-PR",
    slotId: "fri-atsa-pr-1400",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-sat-cccl",
    date: "2024-07-13",
    subjectId: "CCCL",
    slotId: "sat-cccl-1100",
    status: "present",
    markedAt: now,
  },
  {
    id: "log-fri-ba",
    date: "2024-07-09",
    subjectId: "BA",
    slotId: "fri-ba-0900",
    status: "present",
    markedAt: now,
  },
];
