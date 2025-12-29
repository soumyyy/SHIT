import { AttendanceLog } from "./models";

export interface AttendanceStats {
  present: number;
  total: number;
  percentage: number;
  isBelowThreshold: boolean;
}

export const computeAttendance = (
  logs: AttendanceLog[],
  subjectId: string,
  minAttendance = 0.8,
): AttendanceStats => {
  const filtered = logs.filter((log) => log.subjectId === subjectId);
  const present = filtered.filter((log) => log.status === "present").length;
  const total = filtered.length;
  const percentage = total === 0 ? 100 : (present / total) * 100;

  return {
    present,
    total,
    percentage,
    isBelowThreshold: percentage < minAttendance * 100,
  };
};
