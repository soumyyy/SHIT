import { getEffectiveSlots } from "./helpers";
import { AttendanceLog, Settings, SlotOverride, Subject, TimetableSlot } from "./models";

export interface AttendanceStats {
    subjectId: string;
    totalClasses: number;
    attendedClasses: number;
    totalHours: number;
    attendedHours: number;
    percentage: number;
    projectedTotalHours: number; // Total hours for the entire semester
    projectedAbstentHours: number; // Hours already missed
}

/**
 * Calculate attendance statistics for a single subject
 * Iterates through each day of the semester to build accurate history
 */
export function calculateSubjectStats(
    subject: Subject,
    slots: TimetableSlot[],
    logs: AttendanceLog[],
    overrides: SlotOverride[],
    settings: Settings,
    today: Date = new Date()
): AttendanceStats {
    let attendedClasses = 0;
    let totalClasses = 0;
    let attendedHours = 0;
    let totalHours = 0;
    let projectedTotalHours = 0;
    let projectedAbstentHours = 0;

    const startDate = new Date(settings.semesterStartDate);
    const endDate = settings.semesterEndDate
        ? new Date(settings.semesterEndDate)
        : new Date(startDate.getTime() + 150 * 24 * 60 * 60 * 1000); // Default 150 days

    // Iterate day by day from start to end of semester
    const iterDate = new Date(startDate);
    const todayStr = today.toISOString().split("T")[0];

    while (iterDate <= endDate) {
        const dateStr = iterDate.toISOString().split("T")[0];
        const isPastOrToday = dateStr <= todayStr;

        // Get effective schedule for this day
        const daySlots = getEffectiveSlots(dateStr, slots, overrides);
        const subjectSlots = daySlots.filter((s) => s.subjectId === subject.id);

        for (const slot of subjectSlots) {
            const durationHours = slot.durationMinutes / 60;
            projectedTotalHours += durationHours;

            if (isPastOrToday) {
                totalClasses++;
                totalHours += durationHours;

                const log = logs.find(
                    (l) => l.date === dateStr && l.slotId === slot.id && l.subjectId === subject.id
                );

                if (log?.status === "present") {
                    attendedClasses++;
                    attendedHours += durationHours;
                } else if (log?.status === "absent") {
                    projectedAbstentHours += durationHours;
                } else {
                    // No log yet (maybe future time today, or forgot to mark)
                    // For strict calculation, we might count as absent or ignore.
                    // Let's assume ignore for "totalHours" if not marked yet?
                    // Actually, standard is: if passed, it counts.
                    // For simplicty, let's assume if it's past/today, it counts towards total.
                    // If no log, treat as absent for "attended" count (i.e. 0).
                    projectedAbstentHours += durationHours;
                }
            }
        }

        // Next day
        iterDate.setDate(iterDate.getDate() + 1);
    }

    return {
        subjectId: subject.id,
        totalClasses,
        attendedClasses,
        totalHours,
        attendedHours,
        percentage: totalHours > 0 ? (attendedHours / totalHours) * 100 : 100,
        projectedTotalHours,
        projectedAbstentHours,
    };
}

/**
 * Calculate stats for all subjects
 */
export function calculateAllStats(
    subjects: Subject[],
    slots: TimetableSlot[],
    logs: AttendanceLog[],
    overrides: SlotOverride[],
    settings: Settings
): Record<string, AttendanceStats> {
    const stats: Record<string, AttendanceStats> = {};

    for (const subject of subjects) {
        stats[subject.id] = calculateSubjectStats(subject, slots, logs, overrides, settings);
    }

    return stats;
}
