import { Attendance } from '../entities/attendance.entity';

import { formatIST } from '../../../utils/time.util';

export function formatAttendanceResponse(attendance: Attendance) {
  return {
    id: attendance.id,

    employeeId: attendance.employeeId,

    employee: attendance.employee
      ? {
          id: attendance.employee.id,

          employeeCode: attendance.employee.employeeCode,

          name: `${attendance.employee.firstName} ${attendance.employee.lastName}`,

          email: attendance.employee.email,

          profilePhoto: attendance.employee.profilePhoto,

          department: attendance.employee.department?.name ?? null,

          designation: attendance.employee.designation?.name ?? null,
        }
      : null,

    date: attendance.date,

    checkIn: formatIST(attendance.checkIn),

    checkOut: formatIST(attendance.checkOut),

    workedMinutes: attendance.workedMinutes,

    overtimeMinutes: attendance.overtimeMinutes,

    status: attendance.status,

    checkInLocation: attendance.checkInLocation,

    checkOutLocation: attendance.checkOutLocation,

    earlyCheckoutReason: attendance.earlyCheckoutReason,

    isAutoCheckout: attendance.isAutoCheckout,

    createdAt: formatIST(attendance.createdAt),

    updatedAt: formatIST(attendance.updatedAt),
  };
}
