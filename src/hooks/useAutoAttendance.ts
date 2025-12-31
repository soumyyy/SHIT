import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getEffectiveSlots, calculateSemesterEndDate, formatLocalDate } from '@/data/helpers';
import { useData } from '@/data/DataContext';

/**
 * Auto-mark lectures as "present" if 6 hours have passed since they ended
 * and no attendance log exists for them.
 */
export const useAutoAttendance = () => {
    const { slots, slotOverrides, attendanceLogs, settings, markAttendance } = useData();

    const autoMarkPresentLectures = async () => {
        const now = new Date();
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const semesterEnd = calculateSemesterEndDate(settings.semesterStartDate, settings.semesterWeeks);
        const endDate = new Date(semesterEnd);

        // Don't create attendance before semester starts
        const semesterStart = new Date(settings.semesterStartDate);
        semesterStart.setHours(0, 0, 0, 0);

        // Start from the later of: 7 days ago OR semester start date
        const startDate = new Date(Math.max(sevenDaysAgo.getTime(), semesterStart.getTime()));
        startDate.setHours(0, 0, 0, 0);

        // Iterate through valid semester days only
        const currentDate = new Date(startDate);

        while (currentDate <= now && currentDate <= endDate) {
            const dateStr = formatLocalDate(currentDate);

            // Get all slots for this day
            const daySlots = getEffectiveSlots(dateStr, slots, slotOverrides);

            for (const slot of daySlots) {
                // Calculate when this lecture ended
                const [hours, minutes] = slot.startTime.split(':').map(Number);
                const [y, m, d] = dateStr.split('-').map(Number);
                const lectureEnd = new Date(y, m - 1, d, hours, minutes + slot.durationMinutes, 0, 0);

                // Check if 6 hours have passed since lecture ended
                if (lectureEnd < sixHoursAgo) {
                    // Check if attendance log already exists
                    const existingLog = attendanceLogs.find(
                        log => log.date === dateStr && log.slotId === slot.id && log.subjectId === slot.subjectId
                    );

                    // If no log exists, auto-mark as present
                    if (!existingLog) {
                        try {
                            await markAttendance({
                                slotId: slot.id,
                                subjectId: slot.subjectId,
                                status: 'present',
                                date: dateStr,
                            });
                        } catch (error) {
                            console.error('Failed to auto-mark attendance:', error);
                        }
                    }
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
    };

    // Run on mount
    useEffect(() => {
        autoMarkPresentLectures();
    }, []);

    // Run when app comes to foreground
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                autoMarkPresentLectures();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [slots, slotOverrides, attendanceLogs, settings]);
};
