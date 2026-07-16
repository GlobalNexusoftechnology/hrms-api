export enum PermissionEnum {
  // EMPLOYEE
  EMPLOYEE_CREATE = 'employee.create',
  EMPLOYEE_READ = 'employee.read',
  EMPLOYEE_UPDATE = 'employee.update',
  EMPLOYEE_DELETE = 'employee.delete',
  EMPLOYEE_RESTORE = 'employee.restore',

  // DEPARTMENT
  DEPARTMENT_CREATE = 'department.create',
  DEPARTMENT_READ = 'department.read',
  DEPARTMENT_UPDATE = 'department.update',
  DEPARTMENT_DELETE = 'department.delete',

  // DESIGNATION
  DESIGNATION_CREATE = 'designation.create',
  DESIGNATION_READ = 'designation.read',
  DESIGNATION_UPDATE = 'designation.update',
  DESIGNATION_DELETE = 'designation.delete',

  //Attendance

  ATTENDANCE_CREATE = 'attendance.create',
  ATTENDANCE_READ = 'attendance.read',
  ATTENDANCE_UPDATE = 'attendance.update',
  ATTENDANCE_DELETE = 'attendance.delete',

  EMPLOYEE_DASHBOARD_READ = 'dashboard.read',
  ADMIN_DASHBOARD_READ = 'admin_dashboard.read',

  HR_DASHBOARD_READ = 'hr_dashboard.read',

  ATTENDANCE_CORRECTION_CREATE = 'attendance_correction.create',
  ATTENDANCE_CORRECTION_READ = 'attendance_correction.read',
  ATTENDANCE_CORRECTION_UPDATE = 'attendance_correction.update',
  ATTENDANCE_CORRECTION_DELETE = 'attendance_correction.delete',

  LEAVE_CREATE = 'leave.create',
  LEAVE_READ = 'leave.read',
  LEAVE_UPDATE = 'leave.update',
  LEAVE_DELETE = 'leave.delete',
  LEAVE_APPROVAL = 'leave.approval',

  WEEKEND_CREATE = 'weekend.create',
  WEEKEND_READ = 'weekend.read',
  WEEKEND_UPDATE = 'weekend.update',
  WEEKEND_DELETE = 'weekend.delete',

  HOLIDAY_CREATE = 'holiday.create',
  HOLIDAY_READ = 'holiday.read',
  HOLIDAY_UPDATE = 'holiday.update',
  HOLIDAY_DELETE = 'holiday.delete',

  PAYROLL_CREATE = 'payroll.create',
  PAYROLL_READ = 'payroll.read',
  PAYROLL_ALL_READ = 'payroll_all.read',
  PAYROLL_UPDATE = 'payroll.update',
  PAYROLL_DELETE = 'payroll.delete',

  SALARY_CREATE = 'salary.create',
  SALARY_READ = 'salary.read',
  SALARY_UPDATE = 'salary.update',
  SALARY_DELETE = 'salary.delete',

  TRAINING_CREATE = 'training.create',
  TRAINING_READ = 'training.read',
  TRAINING_UPDATE = 'training.update',
  TRAINING_DELETE = 'training.delete',

  INTERVIEW_CREATE = 'interview.create',
  INTERVIEW_READ = 'interview.read',
  INTERVIEW_UPDATE = 'interview.update',
  INTERVIEW_DELETE = 'interview.delete',
}
