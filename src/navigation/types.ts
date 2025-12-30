export type TimetableStackParamList = {
  TimetableToday: undefined;
  FullTimetable: undefined;
  SubjectOverview: {
    subjectId: string;
  };
};

export type RootTabParamList = {
  TimetableTab: undefined;
  AttendanceTab: undefined;
};

export type AttendanceStackParamList = {
  AttendanceList: undefined;
  SubjectAttendance: {
    subjectId: string;
  };
};
