# Tasks: Zerodha Account Connection

**Input**: Design documents from `/specs/003-zerodha-account-connect/`  
**Prerequisites**: plan.md ✅, spec.md ✅  
**Branch**: `003-zerodha-account-connect`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story following TDD (Red-Green-Refactor).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/zerodha-auth/`, `backend/contracts/`, `backend/common/`
- **Frontend**: `frontend/components/`, `frontend/lib/`, `frontend/types/`
- **Tests**: `backend/tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Zerodha SDK setup

- [X] T001 Install kiteconnect SDK: `cd backend && npm install kiteconnect@latest`
- [X] T002 [P] Create Zerodha environment variables in `backend/.env.example`
- [X] T003 [P] Add Zerodha API keys to `backend/common/config/secrets.ts`
- [X] T004 Create `backend/zerodha-auth/` service directory structure
- [X] T005 Create Encore service definition in `backend/zerodha-auth/encore.service.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create type contracts in `backend/contracts/zerodha-api.types.ts` (ConnectionStatus enum, all request/response interfaces)
- [X] T007 [P] Create database types in `backend/contracts/zerodha-db.types.ts` (row interfaces)
- [X] T008 Create database connection in `backend/zerodha-auth/db.ts` (SQLDatabase instance)
- [X] T009 Create migration `backend/zerodha-auth/migrations/001_create_zerodha_connections.up.sql`
- [X] T010 [P] Create migration `backend/zerodha-auth/migrations/002_create_zerodha_balance_history.up.sql`
- [X] T011 [P] Create migration `backend/zerodha-auth/migrations/003_create_zerodha_oauth_states.up.sql`
- [X] T012 Run migrations: `cd backend/zerodha-auth && encore db migrate`
- [X] T013 Create shared KiteConnect client factory in `backend/zerodha-auth/kite-client.ts`
- [X] T014 [P] Create token encryption utility in `backend/zerodha-auth/crypto.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel ✅

---

## Phase 3: User Story 1 - Connect Zerodha Account (Priority: P1) 🎯 MVP

**Goal**: User clicks "Connect Your Account" → Completes OAuth on Zerodha → Returns to Manjha → Sees "Zerodha Connected" status

**Independent Test**: Complete OAuth flow end-to-end. User can connect account and see confirmation without needing balance or reconnection features.

### Tests for User Story 1 (TDD - Write FIRST) ⚠️

> **RED PHASE**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T015 [P] [US1] E2E test for OAuth initiation in `backend/tests/e2e/zerodha-oauth-initiate.test.ts`
- [ ] T016 [P] [US1] E2E test for OAuth callback in `backend/tests/e2e/zerodha-oauth-callback.test.ts`
- [ ] T017 [P] [US1] E2E test for connection status check in `backend/tests/e2e/zerodha-connection-status.test.ts`

**Checkpoint**: Tests written and FAILING (Red phase) ✅

### Implementation for User Story 1 (GREEN PHASE)

#### Backend OAuth Flow

- [X] T018 [P] [US1] Implement OAuth initiation endpoint in `backend/zerodha-auth/auth.ts` (POST /zerodha/oauth/initiate)
- [X] T019 [P] [US1] Implement state generation and storage logic in `backend/zerodha-auth/auth.ts`
- [X] T020 [US1] Implement OAuth callback handler in `backend/zerodha-auth/auth.ts` (GET /zerodha/oauth/callback)
- [X] T021 [US1] Implement token exchange using kiteconnect SDK in `backend/zerodha-auth/auth.ts`
- [X] T022 [US1] Implement connection storage in database with encryption in `backend/zerodha-auth/auth.ts`
- [X] T023 [US1] Implement connection status endpoint in `backend/zerodha-auth/auth.ts` (GET /zerodha/connection/status)
- [X] T024 [US1] Add error handling for OAuth failures (invalid state, token exchange errors)
- [X] T025 [US1] Add logging for all OAuth operations using Encore log

#### Frontend Integration

- [X] T026 [P] [US1] Update `frontend/lib/api-client.ts` with Zerodha OAuth endpoints
- [X] T027 [P] [US1] Create Zerodha types in `frontend/types/zerodha.ts` (import from backend contracts)
- [X] T028 [US1] Update "Connect Your Account" button in `frontend/components/widget-dashboard.tsx` (line 150)
- [X] T029 [US1] Create connection status component in `frontend/components/zerodha-connection-widget.tsx`
- [X] T030 [US1] Add loading states for OAuth flow in `frontend/components/zerodha-connection-widget.tsx`
- [X] T031 [US1] Add error handling UI for failed connections in `frontend/components/zerodha-connection-widget.tsx`

**Checkpoint**: Run E2E tests → All should PASS (Green phase) ✅
**STATUS**: ✅ WORKING IN PRODUCTION - User connected Account ID: EH6383

### Refactor Phase for User Story 1

- [ ] T032 [US1] Refactor: Extract OAuth URL builder to separate function in `backend/zerodha-auth/auth.ts`
- [ ] T033 [US1] Refactor: Extract state validation to reusable function in `backend/zerodha-auth/auth.ts`
- [ ] T034 [US1] Refactor: Improve error messages for better user experience

**Checkpoint**: User Story 1 COMPLETE and INDEPENDENTLY TESTABLE ✅

---

## Phase 4: User Story 2 - View Current Balance (Priority: P2)

**Goal**: Connected users see their real-time Zerodha account balance displayed on dashboard

**Independent Test**: With an active connection (from US1), balance is fetched and displayed accurately. Can test by mocking Zerodha API or using test account.

### Tests for User Story 2 (TDD - Write FIRST) ⚠️

> **RED PHASE**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T035 [P] [US2] E2E test for balance fetch in `backend/tests/e2e/zerodha-balance-fetch.test.ts`
- [ ] T036 [P] [US2] E2E test for balance refresh in `backend/tests/e2e/zerodha-balance-refresh.test.ts`
- [ ] T037 [P] [US2] E2E test for balance display on frontend in `frontend/tests/e2e/zerodha-balance-display.spec.ts`

**Checkpoint**: Tests written and FAILING (Red phase) ✅

### Implementation for User Story 2 (GREEN PHASE)

#### Backend Balance Service

- [X] T038 [P] [US2] Implement balance fetch using kiteconnect in `backend/zerodha-auth/balance.ts` (getMargins API)
- [X] T039 [P] [US2] Implement balance caching logic (5-minute TTL) in `backend/zerodha-auth/balance.ts`
- [X] T040 [US2] Implement balance history storage in `backend/zerodha-auth/balance.ts`
- [X] T041 [US2] Implement balance refresh endpoint in `backend/zerodha-auth/balance.ts` (POST /zerodha/balance/refresh)
- [X] T042 [US2] Add rate limit protection for balance API calls in `backend/zerodha-auth/balance.ts`
- [X] T043 [US2] Add error handling for Zerodha API failures (network, rate limit, token expired)
- [X] T044 [US2] Update connection status endpoint to include balance data

#### Frontend Balance Display

- [ ] T045 [P] [US2] Update `frontend/lib/api-client.ts` with balance endpoints
- [ ] T046 [US2] Add balance display to `frontend/components/zerodha-status.tsx`
- [ ] T047 [US2] Add loading spinner for balance fetch in `frontend/components/zerodha-status.tsx`
- [ ] T048 [US2] Add manual refresh button in `frontend/components/zerodha-status.tsx`
- [ ] T049 [US2] Add error states for balance fetch failures in `frontend/components/zerodha-status.tsx`
- [ ] T050 [US2] Display balance in `frontend/components/widget-dashboard.tsx` near connection status

**Checkpoint**: Run E2E tests → All should PASS (Green phase) ✅

### Refactor Phase for User Story 2

- [ ] T051 [US2] Refactor: Extract balance parsing logic to utility function
- [ ] T052 [US2] Refactor: Improve cache invalidation strategy
- [ ] T053 [US2] Refactor: Format currency display consistently (₹ symbol, commas)

**Checkpoint**: User Story 2 COMPLETE and INDEPENDENTLY TESTABLE ✅

---

## Phase 5: User Story 3 - Reconnect Expired Session (Priority: P3)

**Goal**: Users are notified when their Zerodha session expires (6 AM next day) and can seamlessly reconnect

**Independent Test**: Simulate expired token (set expires_at to past), verify notification appears, user can click "Reconnect", complete OAuth flow, and continue using Manjha.

### Tests for User Story 3 (TDD - Write FIRST) ⚠️

> **RED PHASE**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T054 [P] [US3] E2E test for expired token detection in `backend/tests/e2e/zerodha-token-expiry.test.ts`
- [ ] T055 [P] [US3] E2E test for reconnection flow in `backend/tests/e2e/zerodha-reconnect.test.ts`
- [ ] T056 [P] [US3] E2E test for expiry warning notification in `frontend/tests/e2e/zerodha-expiry-warning.spec.ts`

**Checkpoint**: Tests written and FAILING (Red phase) ✅

### Implementation for User Story 3 (GREEN PHASE)

#### Backend Expiry Detection

- [ ] T057 [P] [US3] Implement expiry calculation function in `backend/zerodha-auth/tokens.ts` (next 6 AM IST logic)
- [ ] T058 [P] [US3] Implement expiry check in connection status endpoint
- [X] T059 [US3] Implement disconnect endpoint in `backend/zerodha-auth/auth.ts` (POST /zerodha/connection/disconnect)
- [ ] T060 [US3] Create Encore CronJob for proactive expiry detection in `backend/zerodha-auth/expiry-monitor.ts`
- [ ] T061 [US3] Implement cron handler to check expiring connections (every 15 minutes)
- [ ] T062 [US3] Update connection status to EXPIRED when token expires
- [ ] T063 [US3] Add logging for expiry events and reconnections

#### Frontend Expiry Handling

- [ ] T064 [P] [US3] Update `frontend/lib/api-client.ts` with disconnect endpoint
- [ ] T065 [US3] Add expiry warning display in `frontend/components/zerodha-status.tsx` (⚠️ icon + minutes until expiry)
- [ ] T066 [US3] Add "Reconnect" button for expired sessions in `frontend/components/zerodha-status.tsx`
- [ ] T067 [US3] Wire "Reconnect" button to OAuth flow (reuse US1 logic)
- [ ] T068 [US3] Add countdown timer for sessions expiring soon (< 30 min) in `frontend/components/zerodha-status.tsx`
- [ ] T069 [US3] Add visual indicators for connection states (ACTIVE: green, EXPIRED: red, WARNING: orange)

**Checkpoint**: Run E2E tests → All should PASS (Green phase) ✅

### Refactor Phase for User Story 3

- [ ] T070 [US3] Refactor: Extract expiry calculation to shared utility
- [ ] T071 [US3] Refactor: Improve cron job error handling and retry logic
- [ ] T072 [US3] Refactor: Consolidate OAuth flow logic (initial connect + reconnect use same code)

**Checkpoint**: User Story 3 COMPLETE and INDEPENDENTLY TESTABLE ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Production-quality improvements and documentation

- [ ] T073 [P] Add comprehensive JSDoc comments to all public APIs in `backend/zerodha-auth/`
- [ ] T074 [P] Create API documentation in `specs/003-zerodha-account-connect/API.md`
- [ ] T075 [P] Update quickstart guide in `specs/003-zerodha-account-connect/quickstart.md`
- [ ] T076 Validate all linter rules pass: `cd backend && npm run lint`
- [ ] T077 [P] Security audit: Verify tokens are encrypted, secrets not in code, HTTPS enforced
- [ ] T078 [P] Performance testing: OAuth flow < 1s, balance fetch < 2s
- [ ] T079 Add monitoring/alerting for Zerodha API errors (optional, if monitoring infrastructure exists)
- [ ] T080 [P] Update `.claude/skills/` with learnings from Zerodha integration
- [ ] T081 Final E2E test: Complete user journey (connect → view balance → reconnect) in `backend/tests/e2e/zerodha-complete-flow.test.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion (NOT dependent on US1, but builds on connection)
- **User Story 3 (Phase 5)**: Depends on Foundational + US1 completion (needs OAuth flow established)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires connection from US1 but can be developed in parallel
- **User Story 3 (P3)**: Depends on US1 (needs OAuth flow) - Can start after US1 is complete

### Within Each User Story (TDD Cycle)

1. **RED**: Write tests FIRST (T015-T017 for US1, T035-T037 for US2, T054-T056 for US3)
2. **GREEN**: Implement features until tests PASS
3. **REFACTOR**: Clean up code while keeping tests green

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003 can run in parallel (different files)

**Phase 2 (Foundational)**:
- T006, T007, T010, T011, T014 can all run in parallel (different files)

**Phase 3 (US1 - Tests)**:
- T015, T016, T017 can run in parallel (different test files)

**Phase 3 (US1 - Backend)**:
- T018, T019 can run in parallel (different functions in auth.ts)

**Phase 3 (US1 - Frontend)**:
- T026, T027 can run in parallel (api-client and types)

**Phase 4 (US2 - Tests)**:
- T035, T036, T037 can run in parallel (different test files)

**Phase 4 (US2 - Backend)**:
- T038, T039 can run in parallel (fetch and cache logic)

**Phase 4 (US2 - Frontend)**:
- T045 can be done while backend is in progress

**Phase 5 (US3 - Tests)**:
- T054, T055, T056 can run in parallel (different test files)

**Phase 5 (US3 - Backend)**:
- T057, T058 can run in parallel (expiry calculation and status check)

**Phase 5 (US3 - Frontend)**:
- T064 can be done while backend is in progress

**Phase 6 (Polish)**:
- T073, T074, T075, T077, T078, T080 can all run in parallel (independent tasks)

---

## Parallel Example: User Story 1

```bash
# RED PHASE: Launch all tests for User Story 1 together
Task T015: "E2E test for OAuth initiation"
Task T016: "E2E test for OAuth callback"
Task T017: "E2E test for connection status check"
# All tests should FAIL at this point

# GREEN PHASE: Launch parallelizable backend tasks
Task T018: "Implement OAuth initiation endpoint"
Task T019: "Implement state generation and storage"

# GREEN PHASE: Launch parallelizable frontend tasks
Task T026: "Update api-client.ts with Zerodha endpoints"
Task T027: "Create Zerodha types in frontend"

# Tests should now PASS
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005) - ~30 minutes
2. Complete Phase 2: Foundational (T006-T014) - ~2 hours
3. Complete Phase 3: User Story 1 (T015-T034) - ~4 hours
4. **STOP and VALIDATE**: Test OAuth flow end-to-end
5. Deploy/demo if ready - **Users can now connect their Zerodha accounts!**

**Estimated MVP Time**: ~6-7 hours for experienced developer

### Incremental Delivery

1. **Week 1**: Setup + Foundational + US1 → **MVP: Account Connection** ✅
2. **Week 1**: Add US2 → **v1.1: Balance Display** ✅
3. **Week 2**: Add US3 → **v1.2: Session Management** ✅
4. **Week 2**: Polish → **v2.0: Production Ready** ✅

### Parallel Team Strategy

With 2-3 developers:

1. **Day 1-2**: Team completes Setup + Foundational together (T001-T014)
2. **Day 3**: Once Foundational is done:
   - **Developer A**: User Story 1 (T015-T034) - OAuth flow
   - **Developer B**: User Story 2 (T035-T053) - Balance (blocked on A's connection logic)
3. **Day 4**:
   - **Developer A**: User Story 3 (T054-T072) - Expiry handling
   - **Developer B**: Polish (T073-T081) - Documentation & testing
4. Stories integrate seamlessly due to independent design

---

## Task Summary

- **Total Tasks**: 81
- **Setup Phase**: 5 tasks
- **Foundational Phase**: 9 tasks
- **User Story 1 (P1 - MVP)**: 20 tasks (3 tests + 17 implementation)
- **User Story 2 (P2)**: 19 tasks (3 tests + 16 implementation)
- **User Story 3 (P3)**: 19 tasks (3 tests + 16 implementation)
- **Polish Phase**: 9 tasks
- **Parallel Opportunities**: 28 tasks marked [P]

**MVP Scope** (Recommended first delivery): Setup + Foundational + User Story 1 = 34 tasks

**Full Feature** (All 3 user stories): 81 tasks

---

## Validation Checklist

Before marking feature complete:

- [ ] All E2E tests pass (T015-T017, T035-T037, T054-T056, T081)
- [ ] OAuth flow completes in < 1s (T078)
- [ ] Balance fetch completes in < 2s (T078)
- [ ] No `any` types in TypeScript (T076)
- [ ] All tokens encrypted in database (T077)
- [ ] API secrets in environment only (T077)
- [ ] HTTPS enforced in production (T077)
- [ ] Logging uses common logger (T025, T044, T063)
- [ ] All three user stories work independently
- [ ] Constitution compliance verified (TDD followed, types strong, frontend dumb)
- [ ] Skills updated with learnings (T080)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **TDD MANDATORY**: Tests written FIRST (Red), implementation (Green), then refactor
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution requires: zero `any` types, E2E tests, common logging, dumb frontend

