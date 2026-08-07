export interface TenantContext {
  tenantId: string;
  organizationId?: string;
  branchId?: string;
  userId: string;
  roleId: string;
  sessionId?: string;
  correlationId?: string;
  timezone?: string;
  locale?: string;
}
