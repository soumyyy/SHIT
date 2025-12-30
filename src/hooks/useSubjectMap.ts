import { useMemo } from "react";
import { Subject } from "@/data/models";

/**
 * Creates a memoized map of subjects by ID for quick lookups
 */
export const useSubjectMap = (subjects: Subject[]) => {
    return useMemo(() => {
        const map: Record<string, Subject> = {};
        subjects.forEach((subject) => {
            map[subject.id] = subject;
        });
        return map;
    }, [subjects]);
};
