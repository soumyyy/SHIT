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

/**
 * Calculate total number of slots for a subject in the entire semester
 */
import { SlotOverride, TimetableSlot } from "./models";

export const projectSemesterCount = (
  subjectId: string,
  regularSlots: TimetableSlot[],
  overrides: SlotOverride[],
  startDateStr: string,
  endDateStr: string
): number => {
  let count = 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return 0;
  }

  // Filter relevant regular slots
  const subjectRegularSlots = regularSlots.filter(s => s.subjectId === subjectId);

  // Create quick lookup for cancellations: Key = originalSlotId + "_" + date(YYYY-MM-DD)
  // Actually override has date. simpler to check overrides map by date.

  // Group overrides by date for efficiency
  const overridesByDate: Record<string, SlotOverride[]> = {};
  overrides.forEach(o => {
    if (!overridesByDate[o.date]) overridesByDate[o.date] = [];
    overridesByDate[o.date].push(o);
  });

  const currentDate = new Date(start);
  while (currentDate <= end) {
    // 0 = Sun, 1 = Mon... (JS)
    // System uses 0 = Mon, 6 = Sun
    const jsDay = currentDate.getDay();
    const systemDay = jsDay === 0 ? 6 : jsDay - 1;
    const dateString = currentDate.toISOString().split("T")[0];

    // 1. Regular slots for this day
    const dayRegularSlots = subjectRegularSlots.filter(s => s.dayOfWeek === systemDay);

    // 2. Overrides for this date
    const dayOverrides = overridesByDate[dateString] || [];
    const cancelledSlotIds = dayOverrides
      .filter(o => o.type === "cancelled")
      .map(o => o.originalSlotId);

    // Add regular slots that are NOT cancelled
    const activeRegulars = dayRegularSlots.filter(s => !cancelledSlotIds.includes(s.id));
    count += activeRegulars.length;

    // 3. Added slots for this subject on this date
    // Note: We must also check if an Added slot was subsequently cancelled (logic in getEffectiveSlots)
    // But getEffectiveSlots handles that logic. We can simplify by just counting "added" that are not "cancelled".
    // The override ID for an added slot is its ID.
    // But a cancellation override targets originalSlotId.
    // So if we have an added slot O1, and a cancellation O2 targeting O1...
    // Wait, current UI creates cancellation for "Added" slots?
    // Yes, rescheduling an added slot creates a cancellation for it.
    const addedSlots = dayOverrides.filter(o => o.type === "added" && o.subjectId === subjectId);
    const addedButCancelledIds = dayOverrides
      .filter(o => o.type === "cancelled")
      .map(o => o.originalSlotId);

    const activeAdded = addedSlots.filter(s => !addedButCancelledIds.includes(s.id));
    count += activeAdded.length;

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};
