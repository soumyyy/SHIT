import { useMemo } from "react";
import { AttendanceLog, Settings, SlotOverride, TimetableSlot } from "@/data/models";
import { computeAttendance, projectSemesterCount } from "@/data/attendance";
import { calculateSemesterEndDate } from "@/data/helpers";

interface UseAttendanceStatsParams {
    subjectId: string;
    attendanceLogs: AttendanceLog[];
    slots: TimetableSlot[];
    slotOverrides: SlotOverride[];
    settings: Settings;
}

export const useAttendanceStats = ({
    subjectId,
    attendanceLogs,
    slots,
    slotOverrides,
    settings,
}: UseAttendanceStatsParams) => {
    const stats = useMemo(
        () => computeAttendance(attendanceLogs, subjectId, settings.minAttendanceThreshold),
        [attendanceLogs, subjectId, settings.minAttendanceThreshold]
    );

    const safeToMissInfo = useMemo(() => {
        const totalProjected = projectSemesterCount(
            subjectId,
            slots,
            slotOverrides,
            settings.semesterStartDate,
            calculateSemesterEndDate(settings.semesterStartDate, settings.semesterWeeks)
        );

        const minRequired = Math.ceil(totalProjected * settings.minAttendanceThreshold);
        const maxMissable = totalProjected - minRequired;
        const alreadyMissed = stats.total - stats.present;
        const safeToMiss = maxMissable - alreadyMissed;

        return {
            totalProjected,
            minRequired,
            maxMissable,
            alreadyMissed,
            safeToMiss,
        };
    }, [subjectId, slots, slotOverrides, settings, stats.total, stats.present]);

    return {
        stats,
        ...safeToMissInfo,
    };
};
