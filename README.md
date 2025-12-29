# SHIT – Personal Timetable & Attendance App

Personal React Native (Expo) project for a minimal two-tab iPhone app that keeps the timetable and attendance log on-device. No publishing plans—this is purely for daily personal use inside Expo Go.

---

## Product Scope

- **Platforms**: iOS via Expo Go (managed workflow)
- **Tabs**: `Timetable`, `Attendance` (no additional tabs or complex navigation)
- **Data residency**: 100% on-device via `AsyncStorage`
- **Semester defaults**: 15 weeks, minimum 80% attendance per subject, customizable through local settings
- **No backend / cloud**, no account system, no push notifications

---

## Core Experience

### Timetable Tab

- **Today view** (default)
  - Cards show `subject`, `start → end`, `room`
  - Tap → `SubjectOverview`
  - Long press or small icon → Attendance quick action modal (date defaults to today, Present pre-selected)
- **Full Timetable screen**
  - Weekly grouped schedule, add/edit/delete slots
  - Tapping a lecture card still leads to `SubjectOverview`
- **Subject Overview screen**
  - Shows all weekly slots for that subject, grouped per weekday, with time and room metadata

### Attendance Tab

- List of subjects with:
  - `% attendance`, `present/total`, `missed`
  - Row styling turns red if percentage `< 80%`
  - Future enhancement placeholder: tap to drill down into logs

---

## Local Data Model (stored as JSON arrays in AsyncStorage)

| Key | Shape |
| --- | --- |
| `@shit/subjects` | `Subject[]` (`{ id, name, defaultRoom?, createdAt }`) |
| `@shit/slots` | `TimetableSlot[]` (`{ id, subjectId, dayOfWeek (0=Mon), startTime, durationMinutes=60, room, createdAt, updatedAt }`) |
| `@shit/attendance` | `AttendanceLog[]` (`{ id, date (YYYY-MM-DD), subjectId, slotId?, status ('present' or 'absent'), markedAt }`) |
| `@shit/settings` | `Settings` (`{ semesterWeeks=15, minAttendance=0.8, semesterStartDate?, version }`) |

Derived attendance logic per subject:

```
totalMarked = logs.filter(subject).length
presentCount = logs.filter(subject && present).length
absentCount = totalMarked - presentCount
percentage = totalMarked === 0 ? 100 : (presentCount / totalMarked) * 100
```

If `percentage < minAttendance` (default 80%), mark UI row with alert theme.

Optional projection (future): compute required sessions vs. can-miss counts from weekly slots and semester length.

---

## Recommended Project Structure

```
src/
  navigation/RootNavigator.tsx         # Tabs + nested stacks
  screens/
    TimetableTodayScreen.tsx
    FullTimetableScreen.tsx
    SubjectOverviewScreen.tsx
    AttendanceScreen.tsx
  components/
    LectureCard.tsx
    DaySection.tsx
    AttendanceModal.tsx
    SubjectRow.tsx
  storage/
    keys.ts                            # AsyncStorage keys
    storage.ts                         # CRUD helpers
  data/
    models.ts                          # Type definitions
    helpers.ts                         # Date/time utilities
    attendance.ts                      # Aggregation + thresholds
  constants/
    theme.ts                           # spacing, colors, alert styling
```

Keep the UI minimal: neutral background, light cards, accent color for primary actions, and a dedicated error/red palette for low attendance.

---

## Implementation Plan

1. **Initialize Expo project**
   - `npx create-expo-app SHIT` (managed workflow)
   - Configure TypeScript, ESLint/Prettier, alias `@/` → `src/`

2. **Scaffold navigation**
   - Install `@react-navigation/native`, bottom tabs, and stack navigators
   - Implement `RootNavigator` with `TimetableTabStack` (Today + nested screens) and `AttendanceTab`

3. **Prototype UI with mocked data**
   - Hardcode sample subjects, slots, and attendance to validate layouts
   - Build `LectureCard`, `DaySection`, `SubjectRow`, `AttendanceModal`
   - Verify Today view, Full Timetable, and Attendance list match UX

4. **Wire up AsyncStorage persistence**
   - Create storage helpers for subjects, slots, attendance logs, settings
   - Replace mock data with live reads on app launch and after CRUD actions
   - Implement attendance computation helpers and context/provider if needed

5. **Implement editing + logging flows**
   - Slot management forms (create/edit/delete) on the Full Timetable screen
   - Attendance modal writes date-based logs with default status `present`
   - Subject Overview surfaces its slots with quick navigation

6. **Polish and validation**
   - Empty states, error toasts, confirm delete prompts
   - Minimal theming + haptics on logging attendance (optional)
   - Manual QA on Expo Go, ensure data persists between reloads

---

## Next Actions

- Confirm package preferences (TypeScript, styling approach e.g. Tailwind vs. StyleSheet)
- Initialize the Expo project and commit the scaffold
- Begin with navigation + dummy data per plan above

Once the scaffold exists, we can tackle each plan item iteratively. Let me know if any requirement should change before we start coding.
