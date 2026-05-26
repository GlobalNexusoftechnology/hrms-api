import { Attendance } from '../entities/attendance.entity';

import { AttendanceStatus } from '../../../common/enums/AttendanceStatus.enum';

import { formatIST } from 'src/utils/time.util';

export function buildAttendanceCalendar(
  records: Attendance[],
  employeeId: string,
  month: number,
  year: number,
) {
  const summary = {
    present: 0,
    late: 0,
    halfDay: 0,
    leave: 0,
    absent: 0,
    holiday: 0,
    weekend: 0,
  };

  records.forEach((item) => {
    switch (item.status) {
      case AttendanceStatus.PRESENT:
        summary.present++;
        break;

      case AttendanceStatus.LATE:
        summary.late++;
        break;

      case AttendanceStatus.HALF_DAY:
        summary.halfDay++;
        break;

      case AttendanceStatus.LEAVE:
        summary.leave++;
        break;

      case AttendanceStatus.ABSENT:
        summary.absent++;
        break;

      case AttendanceStatus.HOLIDAY:
        summary.holiday++;
        break;

      case AttendanceStatus.WEEKEND:
        summary.weekend++;
        break;
    }
  });

  return {
    employeeId,

    month,

    year,

    summary,

    days: records.map((item) => ({
      date: item.date,

      status: item.status,

      checkIn: formatIST(item.checkIn),

      checkOut: formatIST(item.checkOut),

      workedMinutes: item.workedMinutes,

      overtimeMinutes: item.overtimeMinutes,
    })),
  };
}
