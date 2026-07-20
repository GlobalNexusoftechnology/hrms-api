# HRMS — Build Progress Tracker

> **Rule:** Every time something is built or planned, update this file with the date and status.
> **Format:** `✅ Done | 🔄 In Progress | ⏳ Pending | ❌ Blocked`

---

## 📅 Last Updated: 2026-07-20

---

## ═══════════════════════════════════════
## PHASE 1 — Foundation & Core Modules
## ═══════════════════════════════════════

> **Goal:** Build the core HR backbone — Auth, Employees, Attendance, Leave, Payroll, Training, Interviews.
> **Status:** ✅ Complete

---

### ✅ Infrastructure & Project Setup
| Item | Status | Date |
|---|---|---|
| NestJS project scaffolded | ✅ Done | Pre-tracker |
| PostgreSQL + TypeORM configured | ✅ Done | Pre-tracker |
| `.env` configuration | ✅ Done | Pre-tracker |
| `synchronize: false` (migrations only) | ✅ Done | Pre-tracker |
| Rate limiting (`ThrottlerModule`) | ✅ Done | Pre-tracker |
| `ScheduleModule` (cron support) | ✅ Done | Pre-tracker |
| Swagger (`@nestjs/swagger`) | ✅ Done | Pre-tracker |
| `logs/` directory | ✅ Done | Pre-tracker |
| `uploads/` directory | ✅ Done | Pre-tracker |
| `docs/` directory | ✅ Done | Pre-tracker |
| ESLint + Prettier configured | ✅ Done | Pre-tracker |

---

### ✅ Common / Shared Layer
| Item | File | Status | Date |
|---|---|---|---|
| `BaseEntity` (UUID PK, createdAt, updatedAt, deletedAt, createdByUserId, updatedByUserId) | `src/common/entities/base.entity.ts` | ✅ Done | Pre-tracker |
| `PermissionsGuard` | `src/common/guards/permissions.guard.ts` | ✅ Done | Pre-tracker |
| `RolesGuard` | `src/common/guards/roles.guard.ts` | ✅ Done | Pre-tracker |
| Enums directory | `src/common/enums/` | ✅ Done | Pre-tracker |
| Decorators directory | `src/common/decorators/` | ✅ Done | Pre-tracker |
| Filters directory | `src/common/filters/` | ✅ Done | Pre-tracker |
| Interceptors directory | `src/common/interceptors/` | ✅ Done | Pre-tracker |

---

### ✅ Auth Module
| Item | File | Status | Date |
|---|---|---|---|
| JWT Strategy | `src/modules/auth/strategies/` | ✅ Done | Pre-tracker |
| JWT Auth Guard | `src/modules/auth/guards/jwt-auth.guard.ts` | ✅ Done | Pre-tracker |
| `@Public()` decorator | `src/modules/auth/decorators/public.decorator.ts` | ✅ Done | Pre-tracker |
| `@Permissions()` decorator | `src/modules/auth/decorators/permissions.decorator.ts` | ✅ Done | Pre-tracker |
| Auth Service (login, register, refresh) | `src/modules/auth/auth.service.ts` | ✅ Done | Pre-tracker |
| Auth Controller | `src/modules/auth/auth.controller.ts` | ✅ Done | Pre-tracker |
| Auth DTOs | `src/modules/auth/dto/` | ✅ Done | Pre-tracker |
| Auth Entities | `src/modules/auth/entities/` | ✅ Done | Pre-tracker |
| Unit Tests (Auth Service) | `src/modules/auth/auth.service.spec.ts` | ✅ Done | Pre-tracker |
| Unit Tests (Auth Controller) | `src/modules/auth/auth.controller.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Roles & Permissions Module
| Item | File | Status | Date |
|---|---|---|---|
| Roles Module scaffold | `src/modules/roles/roles.module.ts` | ✅ Done | Pre-tracker |
| Roles Service | `src/modules/roles/roles.service.ts` | ⚠️ Stub (empty) | Pre-tracker |
| Roles Controller | `src/modules/roles/roles.controller.ts` | ⚠️ Stub (empty) | Pre-tracker |
| Roles Entity | `src/modules/roles/entities/` | ✅ Done | Pre-tracker |
| Permissions Module | `src/modules/permissions/` | ✅ Done | Pre-tracker |

> **Note:** Roles Service & Controller are near-empty stubs. Full RBAC implementation planned in Phase 2.2.

---

### ✅ Employees Module
| Item | File | Status | Date |
|---|---|---|---|
| Employee Entity | `src/modules/employees/entities/employee.entity.ts` | ✅ Done | Pre-tracker |
| Employee DTOs (Create, Update) | `src/modules/employees/dto/` | ✅ Done | Pre-tracker |
| Employee Service (CRUD + logic) | `src/modules/employees/employees.service.ts` | ✅ Done | Pre-tracker |
| Employee Controller | `src/modules/employees/employees.controller.ts` | ✅ Done | Pre-tracker |
| Unit Tests (Service) | `src/modules/employees/employees.service.spec.ts` | ✅ Done | Pre-tracker |
| Unit Tests (Controller) | `src/modules/employees/employees.controller.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Departments & Designations
| Item | File | Status | Date |
|---|---|---|---|
| Departments Module (full) | `src/modules/departments/` | ✅ Done | Pre-tracker |
| Designations Module (full) | `src/modules/designations/` | ✅ Done | Pre-tracker |

---

### ✅ Employee Documents Module
| Item | File | Status | Date |
|---|---|---|---|
| Employee Documents Module (full) | `src/modules/employee-documents/` | ✅ Done | Pre-tracker |
| File upload to `uploads/` | configured | ✅ Done | Pre-tracker |

---

### ✅ Attendance Module
| Item | File | Status | Date |
|---|---|---|---|
| Attendance Entity | `src/modules/attendance/entities/attendance.entity.ts` | ✅ Done | Pre-tracker |
| Leave Entity | `src/modules/attendance/entities/leave.entity.ts` | ✅ Done | Pre-tracker |
| Correction Entity | `src/modules/attendance/entities/correction.entity.ts` | ✅ Done | Pre-tracker |
| Attendance Service | `src/modules/attendance/Service/` | ✅ Done | Pre-tracker |
| Attendance Controllers | `src/modules/attendance/Controller/` | ✅ Done | Pre-tracker |
| Attendance DTOs | `src/modules/attendance/dto/` | ✅ Done | Pre-tracker |
| Attendance Helpers | `src/modules/attendance/helpers/` | ✅ Done | Pre-tracker |
| Leave Controller (global) | `src/modules/attendance/Controller/leave-controller.controller.ts` | ✅ Done | Pre-tracker |

---

### ✅ Holiday Module
| Item | File | Status | Date |
|---|---|---|---|
| Holiday Entity | `src/modules/holiday/entities/` | ✅ Done | Pre-tracker |
| Holiday Service | `src/modules/holiday/holiday.service.ts` | ✅ Done | Pre-tracker |
| Holiday Controller | `src/modules/holiday/holiday.controller.ts` | ✅ Done | Pre-tracker |
| Holiday DTOs | `src/modules/holiday/dto/` | ✅ Done | Pre-tracker |
| Unit Tests | `src/modules/holiday/*.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Weekend Settings Module
| Item | File | Status | Date |
|---|---|---|---|
| Weekend Settings (full) | `src/modules/weekend_settings/` | ✅ Done | Pre-tracker |
| Unit Tests | `src/modules/weekend_settings/*.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Leave Balance Module
| Item | File | Status | Date |
|---|---|---|---|
| Leave Balance Entity | `src/modules/leave-balance/entities/` | ✅ Done | Pre-tracker |
| Leave Balance Service | `src/modules/leave-balance/leave-balance.service.ts` | ✅ Done | Pre-tracker |
| Leave Balance Controller | `src/modules/leave-balance/leave-balance.controller.ts` | ✅ Done | Pre-tracker |
| Unit Tests | `src/modules/leave-balance/*.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Payroll Module
| Item | File | Status | Date |
|---|---|---|---|
| Payroll Entity | `src/modules/payroll/entities/` | ✅ Done | Pre-tracker |
| Payroll Service (full logic) | `src/modules/payroll/payroll.service.ts` | ✅ Done | Pre-tracker |
| Payroll Controller | `src/modules/payroll/payroll.controller.ts` | ✅ Done | Pre-tracker |
| Payroll DTOs | `src/modules/payroll/dto/` | ✅ Done | Pre-tracker |
| Unit Tests | `src/modules/payroll/*.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Salary Structure Module
| Item | File | Status | Date |
|---|---|---|---|
| Salary Structure Entity | `src/modules/salary-structure/entities/` | ✅ Done | Pre-tracker |
| Salary Structure Service | `src/modules/salary-structure/salary-structure.service.ts` | ✅ Done | Pre-tracker |
| Salary Structure Controller | `src/modules/salary-structure/salary-structure.controller.ts` | ✅ Done | Pre-tracker |
| Unit Tests | `src/modules/salary-structure/*.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Payslip Module
| Item | File | Status | Date |
|---|---|---|---|
| Payslip Module (full) | `src/modules/payslip/` | ✅ Done | Pre-tracker |

---

### ✅ Training Module
| Item | File | Status | Date |
|---|---|---|---|
| Training Entity | `src/modules/training/entities/` | ✅ Done | Pre-tracker |
| Training Service (full) | `src/modules/training/training.service.ts` | ✅ Done | Pre-tracker |
| Training Controller | `src/modules/training/training.controller.ts` | ✅ Done | Pre-tracker |
| HR Training Controller | `src/modules/training/hr-training.controller.ts` | ✅ Done | Pre-tracker |
| Unit Tests | `src/modules/training/*.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Interview Module
| Item | File | Status | Date |
|---|---|---|---|
| Interview Entity | `src/modules/interview/entities/` | ✅ Done | Pre-tracker |
| Interview Service (full) | `src/modules/interview/interview.service.ts` | ✅ Done | Pre-tracker |
| Interview Controller | `src/modules/interview/interview.controller.ts` | ✅ Done | Pre-tracker |
| HR Interview Controller | `src/modules/interview/hr-interview.controller.ts` | ✅ Done | Pre-tracker |
| Unit Tests | `src/modules/interview/*.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Dashboard Module
| Item | File | Status | Date |
|---|---|---|---|
| Dashboard Service (analytics) | `src/modules/dashboard/dashboard.service.ts` | ✅ Done | Pre-tracker |
| Dashboard Controller | `src/modules/dashboard/dashboard.controller.ts` | ✅ Done | Pre-tracker |
| Unit Tests | `src/modules/dashboard/*.spec.ts` | ✅ Done | Pre-tracker |

---

### ✅ Mail Module
| Item | File | Status | Date |
|---|---|---|---|
| Mail Module (email sending) | `src/modules/mail/` | ✅ Done | Pre-tracker |

---

---

## ═══════════════════════════════════════
## PHASE 2 — SaaS Multi-Tenant Architecture
## ═══════════════════════════════════════

> **Goal:** Rebuild the foundation to be truly organization-driven and configuration-based.
> **Reference:** `docs/organization_architecture.md`

---

## ─────────────────────────────────────
## Phase 2.1A — Core Organization
## ─────────────────────────────────────

> **Status:** ✅ Complete
> **Completed On:** 2026-07-20

| Item | File | Status | Date |
|---|---|---|---|
| `BaseEntity` upgraded (UUID, soft delete, audit fields) | `src/common/entities/base.entity.ts` | ✅ Done | 2026-07-20 |
| `Organization` entity (name, legalName, email, phone, code, status, logo) | `src/modules/organization/entities/organization.entity.ts` | ✅ Done | 2026-07-20 |
| `OrganizationAddress` entity (type: REGISTERED/OPERATIONAL, lat/lng) | `src/modules/organization/entities/organization-address.entity.ts` | ✅ Done | 2026-07-20 |
| `OrganizationTax` entity (PAN, GST, TAN, CIN, MSME) | `src/modules/organization/entities/organization-tax.entity.ts` | ✅ Done | 2026-07-20 |
| `OrganizationSettings` entity (timezone, currency, language, dateFormat, weekStartDay, financialYearStartMonth) | `src/modules/organization/entities/organization-settings.entity.ts` | ✅ Done | 2026-07-20 |
| Create Organization DTO | `src/modules/organization/dto/create-organization.dto.ts` | ✅ Done | 2026-07-20 |
| Update Organization DTO | `src/modules/organization/dto/update-organization.dto.ts` | ✅ Done | 2026-07-20 |
| Create Address DTO | `src/modules/organization/dto/create-organization-address.dto.ts` | ✅ Done | 2026-07-20 |
| Create Tax DTO | `src/modules/organization/dto/create-organization-tax.dto.ts` | ✅ Done | 2026-07-20 |
| Create Settings DTO | `src/modules/organization/dto/create-organization-settings.dto.ts` | ✅ Done | 2026-07-20 |
| Organization Service (singleton get/create/update/uploadLogo) | `src/modules/organization/services/organization.service.ts` | ✅ Done | 2026-07-20 |
| Organization Address Service | `src/modules/organization/services/organization-address.service.ts` | ✅ Done | 2026-07-20 |
| Organization Tax Service | `src/modules/organization/services/organization-tax.service.ts` | ✅ Done | 2026-07-20 |
| Organization Settings Service | `src/modules/organization/services/organization-settings.service.ts` | ✅ Done | 2026-07-20 |

---

## ─────────────────────────────────────
## Phase 2.1B — Supporting Resources
## ─────────────────────────────────────

> **Status:** ✅ Complete
> **Completed On:** 2026-07-20

| Item | File | Status | Date |
|---|---|---|---|
| `Branch` entity (name, code, isHeadOffice, address, timezone, managerId) | `src/modules/organization/entities/branch.entity.ts` | ✅ Done | 2026-07-20 |
| `OrganizationBankAccount` entity | `src/modules/organization/entities/organization-bank-account.entity.ts` | ✅ Done | 2026-07-20 |
| `OrganizationContact` entity | `src/modules/organization/entities/organization-contact.entity.ts` | ✅ Done | 2026-07-20 |
| `OrganizationDocument` entity | `src/modules/organization/entities/organization-document.entity.ts` | ✅ Done | 2026-07-20 |
| Create Branch DTO | `src/modules/organization/dto/create-branch.dto.ts` | ✅ Done | 2026-07-20 |
| Create BankAccount DTO | `src/modules/organization/dto/create-organization-bank-account.dto.ts` | ✅ Done | 2026-07-20 |
| Create Contact DTO | `src/modules/organization/dto/create-organization-contact.dto.ts` | ✅ Done | 2026-07-20 |
| Create Document DTO | `src/modules/organization/dto/create-organization-document.dto.ts` | ✅ Done | 2026-07-20 |
| Branch Service | `src/modules/organization/services/branch.service.ts` | ✅ Done | 2026-07-20 |
| Organization Bank Account Service | `src/modules/organization/services/organization-bank-account.service.ts` | ✅ Done | 2026-07-20 |
| Organization Contact Service | `src/modules/organization/services/organization-contact.service.ts` | ✅ Done | 2026-07-20 |
| Organization Document Service (with file upload) | `src/modules/organization/services/organization-document.service.ts` | ✅ Done | 2026-07-20 |
| Organization Controller (ALL endpoints) | `src/modules/organization/organization.controller.ts` | ✅ Done | 2026-07-20 |
| Organization Module (wiring) | `src/modules/organization/organization.module.ts` | ✅ Done | 2026-07-20 |
| Bootstrap Service (`POST /system/bootstrap`) — Transaction-wrapped one-time init | `src/modules/system/services/bootstrap.service.ts` | ✅ Done | 2026-07-20 |
| System Controller | `src/modules/system/system.controller.ts` | ✅ Done | 2026-07-20 |
| System Module | `src/modules/system/system.module.ts` | ✅ Done | 2026-07-20 |
| Bootstrap DTO | `src/modules/system/dto/bootstrap.dto.ts` | ✅ Done | 2026-07-20 |

> **Known Gap:** `isHeadOffice` enforcement — if a second branch is marked `isHeadOffice: true`, the old head office is NOT automatically unset. Fix needed.
> **Known Gap:** Bootstrap `adminUser` is logged but NOT persisted — waiting for Phase 2.2 RBAC.

---

## ─────────────────────────────────────
## Phase 2.2 — Attendance Foundation
## ─────────────────────────────────────

> **Status:** ⏳ Pending
> **Target Start:** TBD

| Item | File | Status | Date |
|---|---|---|---|
| `Shift` entity (name, startTime, endTime, orgId, branchId) | `src/modules/attendance/entities/shift.entity.ts` | ⏳ Pending | — |
| `Break` entity (name, duration, linked to Shift) | `src/modules/attendance/entities/break.entity.ts` | ⏳ Pending | — |
| `WorkingDayPolicy` entity (which days are working days) | `src/modules/attendance/entities/working-day-policy.entity.ts` | ⏳ Pending | — |
| `HolidayCalendar` entity (org-scoped, year-based) | to be determined | ⏳ Pending | — |
| `AttendanceConfiguration` entity (late mark grace, overtime rules, etc.) | `src/modules/attendance/entities/attendance-config.entity.ts` | ⏳ Pending | — |
| Shift Service + Controller + DTOs | — | ⏳ Pending | — |
| Break Service + Controller + DTOs | — | ⏳ Pending | — |
| Working Day Policy Service + Controller + DTOs | — | ⏳ Pending | — |
| Attendance Config Service + Controller + DTOs | — | ⏳ Pending | — |
| Full RBAC (Roles + Permissions populated) | — | ⏳ Pending | — |
| Admin User creation from bootstrap | — | ⏳ Pending | — |
| Unit Tests | — | ⏳ Pending | — |

---

## ─────────────────────────────────────
## Phase 2.3 — Leave Foundation
## ─────────────────────────────────────

> **Status:** ⏳ Pending
> **Target Start:** After Phase 2.2

| Item | File | Status | Date |
|---|---|---|---|
| `LeaveType` entity (CL, SL, PL, etc. — org-scoped) | — | ⏳ Pending | — |
| `LeaveRules` entity (max days, carry-forward, encashment rules) | — | ⏳ Pending | — |
| `LeavePolicy` entity (maps LeaveType + Rules together) | — | ⏳ Pending | — |
| Leave Type Service + Controller + DTOs | — | ⏳ Pending | — |
| Leave Rules Service + Controller + DTOs | — | ⏳ Pending | — |
| Leave Policy Service + Controller + DTOs | — | ⏳ Pending | — |
| Unit Tests | — | ⏳ Pending | — |

---

## ─────────────────────────────────────
## Phase 2.4 — Payroll Foundation
## ─────────────────────────────────────

> **Status:** ⏳ Pending
> **Target Start:** After Phase 2.3

| Item | File | Status | Date |
|---|---|---|---|
| `SalaryComponent` entity (Basic, HRA, PF, TDS — org-scoped, type: earning/deduction) | — | ⏳ Pending | — |
| `SalaryTemplate` entity (reusable structure linking multiple components) | — | ⏳ Pending | — |
| `PayrollConfiguration` entity (cycle, pay day, effective dates) | — | ⏳ Pending | — |
| Salary Component Service + Controller + DTOs | — | ⏳ Pending | — |
| Salary Template Service + Controller + DTOs | — | ⏳ Pending | — |
| Payroll Config Service + Controller + DTOs | — | ⏳ Pending | — |
| Unit Tests | — | ⏳ Pending | — |

---

---

## ═══════════════════════════════════════
## PHASE 3 — Future Modules (Reserved)
## ═══════════════════════════════════════

> These will follow the same 16-step SOP defined in `organization_architecture.md`

| Module | Status |
|---|---|
| Recruitment / Job Postings | ⏳ Future |
| Assets Management | ⏳ Future |
| Performance / Appraisal | ⏳ Future |
| Claims & Expenses | ⏳ Future |
| Travel Management | ⏳ Future |
| Visitor Management | ⏳ Future |
| Helpdesk / Ticketing | ⏳ Future |
| Chat / Messaging | ⏳ Future |
| Knowledge Base | ⏳ Future |

---

---

## 📝 Change Log

| Date | Who | What Changed |
|---|---|---|
| 2026-07-20 | Team | Created this PROGRESS.md tracker |
| 2026-07-20 | Team | Completed Phase 2.1A (Core Organization) |
| 2026-07-20 | Team | Completed Phase 2.1B (Supporting Resources + Bootstrap) |
| 2026-07-20 | Team | Fixed: isHeadOffice uniqueness validation in BranchService (POST + PATCH) |
| 2026-07-20 | Team | Added: PATCH /organization/logo endpoint |
| 2026-07-20 | Team | Added: GET /organization/branch/:id/contact (branch-scoped contacts) |
| 2026-07-20 | Team | Added: POST /organization/branch/:id/contact (add contact to specific branch) |
| 2026-07-20 | Team | Updated: GET /organization/contact now returns only org-level contacts (branchId=null) |
| 2026-07-20 | Team | Added: SystemConfig entity (generic key-value app config table) |
| 2026-07-20 | Team | Added: isProtected column to Role entity (guards SUPER_ADMIN from destructive ops) |
| 2026-07-20 | Team | Added: RBACInitializerService in Roles module (seeds permissions + SUPER_ADMIN role, idempotent) |
| 2026-07-20 | Team | Rewrote: BootstrapService as pure orchestrator (delegates to RBACInitializerService) |
| 2026-07-20 | Team | Updated: BootstrapSystemDto — ChairmanBootstrapDto with firstName, lastName, mobile |
| 2026-07-20 | Team | Updated: SystemModule wired with RolesModule + all required entities |
| 2026-07-20 | Team | Migration: 1784300000000-BootstrapInfra — system_config table + is_protected column APPLIED |
| 2026-07-20 | Team | Bootstrap now returns 409 Conflict (not 410) on repeated calls |
| 2026-07-20 | Team | Bootstrap is now idempotent — safe to re-run in development |
| 2026-07-20 | Team | Removed: @Public() decorators from all Organization module endpoints |
| 2026-07-20 | Team | Injected: @CurrentUser() and createdByUserId/updatedByUserId handling across all 8 Organization services via AST transformations |
| 2026-07-20 | Team | Added: Team Module foundation (entities, controller, service) linked to Departments and Employees |
| 2026-07-20 | Team | Added: Notification & NotificationPreference Modules foundation |
| 2026-07-20 | Team | Migration: 1784558068151-Team_and_notification APPLIED |

---

> **How to use this file:**
> - When you start working on something → change `⏳ Pending` to `🔄 In Progress` and add today's date
> - When it is done → change to `✅ Done` and confirm the date
> - When something is blocked → change to `❌ Blocked` and add a note explaining why


