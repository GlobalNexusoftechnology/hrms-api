# SaaS HRMS Architecture Decision Record (ADR) & Development SOP

This document is the definitive Architecture Decision Record (ADR) and Standard Operating Procedure (SOP) for the HRMS. It explains both the *what* and the *why* behind the system's design. If you step away from the project for months, this document will instantly realign you with the project's philosophy, relationships, rules, and development lifecycle.

---

## 1. Architecture Rules & Core Principles

This is the non-negotiable philosophy of the project.

### Core Principles
- **No hardcoded business rules.**
- **Everything is organization-driven.**
- **Every business entity belongs to an organization** (Multi-tenant isolation).
- **Soft delete only.** (Never `DELETE` from DB, always `UPDATE deleted_at = NOW()`).
- **Every change is auditable.** (Who did what and when).
- **Configuration over code.**
- **Prefer normalization over duplication.**
- **Transactions for multi-step operations.**
- **Domain-driven module separation.**

### Explicit Architecture Rules
✓ **No module may directly access another module's database tables.**
✓ **Communication happens through services.**
✓ **Never duplicate business logic.**
✓ **Never hardcode company policies.**
✓ **Configuration must live in configuration tables.**
✓ **All APIs use a standard response format.**
✓ **All entities inherit from `BaseEntity`.**
✓ **Use UUIDs for primary keys.**
✓ **Use DB transactions for multi-step operations** (e.g., Onboarding, Payroll).
✓ **RBAC and permissions are enforced at the API layer.**
✓ **Swagger documentation is required for every endpoint.**
✓ **Unit tests are required for business logic.**
✓ **Migrations only**—never use `synchronize: true` in production.
✓ **Avoid Circular Dependencies**—use well-defined interfaces or shared services.

---

## 2. Domain Boundary Diagram

Instead of one monolithic module, the project is grouped conceptually into Domains.

```text
Organization Domain
│
├── Organization
├── Branch
├── OrganizationAddress
├── OrganizationTax
├── OrganizationBankAccount
├── OrganizationContact
├── OrganizationDocument
├── OrganizationSettings
│
Attendance Domain
│
├── Shift
├── Break
├── Attendance Config
├── Working Day Policy
├── Holiday
│
Leave Domain
│
├── Leave Type
├── Leave Policy
│
Payroll Domain
│
├── Salary Component
├── Salary Template
├── Payroll Config
```

---

## 3. The Relationship Map

Every table enforces true SaaS isolation via `organization_id`. 

```text
Organization
├── 1 → 1 OrganizationSettings (Timezone, currency, language)
├── 1 → 1 OrganizationTax (PAN, GST, CIN)
├── 1 → 1 OrganizationAddress (Base location)
├── 1 → N Branch (Offices, Warehouses)
├── 1 → N OrganizationBankAccount (Primary/Secondary)
├── 1 → N OrganizationContact (HR, Finance, CEO)
├── 1 → N OrganizationDocument (Certificates, Policies)
├── 1 → N Shift (Morning, Night)
│       └── 1 → N Break (Lunch, Tea)
├── 1 → N Holiday (Calendar dates)
├── 1 → N LeavePolicy (Types, Accruals)
├── 1 → N SalaryTemplate (Reusable structures)
│       └── N → M SalaryComponent (Basic, HRA, PF)
└── 1 → N PayrollConfiguration (Cycles, Dates)
```

---

## 4. Single Source of Truth

To ensure consistency, dynamic modules read strictly from configuration tables.

- **Employee** reads from:
  - `Organization`, `Branch`, `Shift`
- **Attendance** reads from:
  - `AttendanceConfiguration`, `Shift`, `WorkingDayPolicy`, `Holiday`
- **Leave** reads from:
  - `LeavePolicy`, `LeaveType`
- **Payroll** reads from:
  - `PayrollConfiguration`, `SalaryTemplate`, `SalaryComponent`

---

## 5. Core Architectural Patterns

### A. The Base Entity (Auditing & Status)
All major entities inherit from a common `BaseEntity`:
- `status`: Enum (ACTIVE, INACTIVE, ARCHIVED)
- `created_by`: UUID
- `updated_by`: UUID
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `deleted_at`: Timestamp (Soft Delete)

### B. Validation Layers
Data goes through a strict pipeline before hitting the database:
`DTO Validation` → `Business Rules Validation` → `Database Constraints`

### C. Transactions
Always use Database Transactions for operations that cross multiple tables to prevent orphaned data:
- Organization Creation (Onboarding)
- Employee Creation
- Payroll Generation
- Leave Approval
- Attendance Correction
- Salary Processing

### D. Policy Versioning
Configuration tables include `effective_from` and `effective_to` dates. This ensures running historical payrolls based on past rules remains perfectly accurate.

---

## 6. Naming Conventions & Folder Structure

### Naming Conventions
Consistency is key to a massive codebase.
- **Module**: `organization`
- **Entity**: `Organization`
- **DTO**: `CreateOrganizationDto`
- **Service**: `OrganizationService`
- **Controller**: `OrganizationController`
- **Repository**: `OrganizationRepository`

### Project Folder Structure
```text
src/
  ├── modules/
  │   ├── organization/
  │   ├── branch/
  │   ├── shift/
  │   ├── attendance-config/
  │   ├── leave-policy/
  │   ├── salary-template/
  │   └── payroll-config/
  ├── shared/
  ├── common/
  ├── database/
  ├── guards/
  ├── decorators/
  ├── filters/
  └── interceptors/
```

### Module Dependencies
Data flows linearly to prevent circular dependencies.
`Organization` ➔ `Branch` ➔ `Employee` ➔ `Attendance` ➔ `Payroll`

---

## 7. The 16-Step Development Workflow (SOP)

This workflow ensures every module is built correctly without requiring mid-stream refactors.

### Phase 0 – Architecture Design (No Coding)
1. **Finalize the Domain Model**: Write down every entity before creating any code.
2. **Draw Relationships**: Define 1:1, 1:N, N:M ownership.
3. **Decide Responsibilities**: An entity should do *exactly one thing*.
4. **The Pre-Code Entity Questionnaire**: Answer these before coding:
   - *Why does this entity exist?*
   - *Who owns it?*
   - *Can it exist alone?*
   - *Which modules use it?*
   - *Is it configuration or transactional?*
   - *Does it need versioning?*
   - *Does it need soft delete & audit fields?*

### Phase 1 to 7 – Implementation Checklist
For every single module, follow this exact sequence:
1. Understand the business requirement.
2. Design the database schema (Ensure normalization).
3. Define entity relationships.
4. Review the design.
5. **Create Entities** (Keep them clean, no business logic).
6. **Generate and review migration** (Never use `synchronize: true`).
7. **Run migration**.
8. **Create DTOs** (Separate Create, Update, and Response).
9. **Implement service logic** (Business rules live here ONLY).
10. **Implement controller** (Design the API from frontend perspective first).
11. Add Swagger documentation.
12. Add RBAC/permissions.
13. Write unit tests.
14. Test with Postman.
15. Code review and refactor.
16. Merge.

---

## 8. The Execution Plan

### Phase 2.1A: Core Organization
- `BaseEntity`
- `Organization` (Identity only)
- `OrganizationAddress`
- `OrganizationTax`
- `OrganizationSettings`

### Phase 2.1B: Supporting Resources
- `Branch`
- `OrganizationBankAccount`
- `OrganizationContact`
- `OrganizationDocument`
- `OrganizationOnboardingService` (Scaffold transaction with default seeds)

### Phase 2.2: Attendance Foundation
- `Shift` & `Break`
- `WorkingDayPolicy`
- `HolidayCalendar`
- `AttendanceConfiguration`

### Phase 2.3: Leave Foundation
- `LeaveType` & `LeaveRules`

### Phase 2.4: Payroll Foundation
- `SalaryComponent` & `SalaryTemplate`
- `PayrollConfiguration`

---

## 9. Future Modules (Reserved Space)
As the HRMS grows, these domains will be added following the exact same principles:
- **Recruitment**
- **Assets**
- **Performance / Appraisal**
- **Claims & Expenses**
- **Travel**
- **Visitor Management**
- **Helpdesk / Ticketing**
- **Chat**
- **Knowledge Base**
