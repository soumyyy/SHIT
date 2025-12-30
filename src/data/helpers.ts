const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const getTodayDayOfWeek = (today: Date = new Date()): number => {
  const day = today.getDay();
  // Date.getDay(): 0 = Sunday ... 6 = Saturday. Convert to 0 = Monday.
  return day === 0 ? 6 : day - 1;
};

export const getDayLabel = (dayOfWeek: number): string => DAYS[dayOfWeek] ?? "Day";

export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTimeRange = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours);
  startDate.setMinutes(minutes);

  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
};

import { SlotOverride, TimetableSlot } from "./models";

export interface EffectiveSlot extends TimetableSlot {
  isOverridden?: boolean;
  overrideType?: "cancelled" | "modified" | "added";
}

/**
 * Get effective slots for a specific date, applying any overrides
 */
export function getEffectiveSlots(
  date: string, // YYYY-MM-DD
  regularSlots: TimetableSlot[],
  overrides: SlotOverride[]
): EffectiveSlot[] {
  // Get day of week from date (0 = Monday)
  // Safely parse YYYY-MM-DD as local date
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = (dateObj.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

  // Get overrides for this specific date
  const dateOverrides = overrides.filter((o) => o.date === date);

  // Start with regular slots for this day
  let effectiveSlots: EffectiveSlot[] = regularSlots
    .filter((slot) => slot.dayOfWeek === dayOfWeek)
    .map((slot) => ({ ...slot }));

  // Apply cancellations
  const cancelledSlotIds = dateOverrides
    .filter((o) => o.type === "cancelled")
    .map((o) => o.originalSlotId);

  effectiveSlots = effectiveSlots.filter(
    (slot) => !cancelledSlotIds.includes(slot.id)
  );

  // Apply modifications
  dateOverrides
    .filter((o) => o.type === "modified")
    .forEach((override) => {
      const slotIndex = effectiveSlots.findIndex(
        (s) => s.id === override.originalSlotId
      );
      if (slotIndex !== -1) {
        effectiveSlots[slotIndex] = {
          ...effectiveSlots[slotIndex],
          durationMinutes: override.durationMinutes ?? effectiveSlots[slotIndex].durationMinutes,
          room: override.room ?? effectiveSlots[slotIndex].room,
          isOverridden: true,
          overrideType: "modified",
        };
      }
    });

  // Add one-time slots
  dateOverrides
    .filter((o) => o.type === "added" && o.subjectId && o.startTime && o.durationMinutes)
    .forEach((override) => {
      // Check if this added slot has been cancelled
      if (cancelledSlotIds.includes(override.id)) {
        return;
      }

      effectiveSlots.push({
        id: override.id,
        subjectId: override.subjectId!,
        dayOfWeek,
        startTime: override.startTime!,
        durationMinutes: override.durationMinutes!,
        room: override.room || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOverridden: true,
        overrideType: "added",
      });
    });

  // Sort by start time
  effectiveSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return effectiveSlots;
}

/**
 * Calculate semester end date from start date and number of weeks
 */
export const calculateSemesterEndDate = (startDate: string, weeks: number): string => {
  const [year, month, day] = startDate.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  start.setDate(start.getDate() + weeks * 7 - 1); // -1 because we include the start day
  return formatLocalDate(start);
};
