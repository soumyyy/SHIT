export type TimetableStackParamList = {
  TimetableToday: undefined;
  FullTimetable: undefined;
  SubjectOverview: {
    subjectId: string;
  };
  ManageTimetable: undefined;
};

export type RootTabParamList = {
  TimetableTab: undefined;
  AttendanceTab: undefined;
};

export type AttendanceStackParamList = {
  List: undefined;
  SubjectAttendance: {
    subjectId: string;
  };
};
