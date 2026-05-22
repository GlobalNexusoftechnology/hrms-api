import { RoleEnum } from '../enums/role.enum';

import { PermissionEnum } from '../enums/permission.enum';

export const RBAC_CONFIG = {
  [RoleEnum.SUPER_ADMIN]: [...Object.values(PermissionEnum)],

  [RoleEnum.HR]: [
    PermissionEnum.EMPLOYEE_CREATE,
    PermissionEnum.EMPLOYEE_READ,
    PermissionEnum.EMPLOYEE_UPDATE,

    PermissionEnum.DEPARTMENT_CREATE,
    PermissionEnum.DEPARTMENT_READ,
    PermissionEnum.DEPARTMENT_UPDATE,

    PermissionEnum.DESIGNATION_CREATE,
    PermissionEnum.DESIGNATION_READ,
    PermissionEnum.DESIGNATION_UPDATE,
    PermissionEnum.DESIGNATION_DELETE,

    PermissionEnum.ATTENDANCE_CREATE,
    PermissionEnum.ATTENDANCE_UPDATE,
    PermissionEnum.ATTENDANCE_READ,

    PermissionEnum.ATTENDANCE_CORRECTION_CREATE,
    PermissionEnum.ATTENDANCE_CORRECTION_READ,
    PermissionEnum.ATTENDANCE_CORRECTION_UPDATE,

    PermissionEnum.LEAVE_CREATE,
    PermissionEnum.LEAVE_READ,
    PermissionEnum.LEAVE_UPDATE,


  ],

  //   [RoleEnum.MANAGER]: [PermissionEnum.EMPLOYEE_READ],

  [RoleEnum.EMPLOYEE]: [
    PermissionEnum.EMPLOYEE_READ,
    PermissionEnum.ATTENDANCE_CREATE,
    PermissionEnum.ATTENDANCE_READ,
    

    PermissionEnum.ATTENDANCE_CORRECTION_CREATE,
    PermissionEnum.ATTENDANCE_CORRECTION_READ,

    PermissionEnum.LEAVE_CREATE,
    PermissionEnum.LEAVE_READ,
    PermissionEnum.LEAVE_UPDATE,
  ],
};
