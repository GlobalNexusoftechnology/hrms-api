export type JwtPayload = {
  sub: string;
  employeeId: string;
  employeeCode: string;
  roleId: string;
  tenantId: string;
  sessionId?: string;
};
