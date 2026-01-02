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

weekly run: ``` npx expo run:ios --device "Soumya's iPhone" --configuration Release ```