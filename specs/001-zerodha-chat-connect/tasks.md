# Tasks: Zerodha Chat Connect

**Input**: Design documents from `/specs/001-zerodha-chat-connect/`
**Prerequisites**: plan.md, spec.md

**Tests**: Playwright end-to-end flows are required for each user story per TDD mandate.

**Organization**: Tasks are grouped by user story to keep each slice independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capture environment pre-work so the team can run the Prisma-backed backend and Kite MCP locally.

- [ ] T001 Update `backend/.env.example` with `DATABASE_URL`, `DIRECT_URL`, and `KITE_MCP_ENDPOINT=https://mcp.kite.trade/mcp`
- [ ] T002 Add `mcp-remote` dependency and scripts in `backend/package.json` for local MCP connectivity checks
- [ ] T003 Record Playwright execution instructions in `backend/tests/e2e/README.md` referencing Prisma migrations + MCP prerequisites

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core scaffolding required before any user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Model conversation + Zerodha state entities in `backend/prisma/schema.prisma`
- [ ] T005 Implement Prisma client helper in `backend/src/services/persistence/prismaClient.ts`
- [ ] T006 Scaffold `backend/src/agents/zerodha-agent/index.ts` with typed interface of MCP operations (login, status placeholders)
- [ ] T007 Extend broker event channel configuration in `backend/src/logging/logger.ts` for `zerodhaAgent` events

**Checkpoint**: Foundation ready – user story implementation can now begin.

---

## Phase 3: User Story 1 - Chatting Creates Immediate Value (Priority: P1) 🎯 MVP

**Goal**: Persist chat conversations by `userId` so users see their messages and AI replies after a refresh.

**Independent Test**: Run the Playwright flow that sends a message, receives an AI reply, reloads the page, and verifies the conversation renders from the Prisma-backed store.

### Tests for User Story 1

- [ ] T008 [US1] Author Playwright spec `backend/tests/e2e/chat-persistence.spec.ts` that fails until persistence exists

### Implementation for User Story 1

- [ ] T009 [US1] Implement `chatRepository` with create/list functions in `backend/src/services/persistence/chatRepository.ts`
- [ ] T010 [US1] Extend chat tRPC mutation in `backend/src/routes/chat/router.ts` to persist user/system messages via `chatRepository`
- [ ] T011 [P] [US1] Update chat API client to include `userId` in `frontend/lib/api/chat.ts`
- [ ] T012 [P] [US1] Load persisted conversation in `frontend/components/chat/chat-panel.tsx` on mount using new API response fields
- [ ] T013 [US1] Ensure session metadata TTL logic in `backend/src/services/persistence/sessionStore.ts`

**Checkpoint**: User Story 1 functional and testable independently.

---

## Phase 4: User Story 2 - Prompt Zerodha Connect (Priority: P2)

**Goal**: When Zerodha is unlinked, surface a Kite MCP-driven login prompt inside chat and the Zerodha widget.

**Independent Test**: Execute the Playwright flow that selects Zerodha, triggers a broker-specific question, receives a login prompt with MCP authorization URL, and sees the CTA in the UI.

### Tests for User Story 2

- [ ] T014 [US2] Author Playwright spec `backend/tests/e2e/chat-zerodha-login.spec.ts` expecting a login prompt for disconnected users

### Implementation for User Story 2

- [ ] T015 [US2] Implement `login` tool wrapper in `backend/src/agents/zerodha-agent/login.ts` using `mcp-remote`
- [ ] T016 [US2] Persist login prompt metadata in `backend/src/services/persistence/zerodhaStateRepository.ts`
- [ ] T017 [US2] Branch chat orchestration in `backend/src/routes/chat/router.ts` to invoke `zerodha-agent.login` when status is unauthenticated
- [ ] T018 [P] [US2] Render Zerodha connect CTA in `frontend/components/zerodha-connection-widget.tsx` based on response payload
- [ ] T019 [P] [US2] Display login warning chip within chat messages in `frontend/components/chat/message-list.tsx`

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Conversational Zerodha Status (Priority: P3)

**Goal**: Provide accurate Zerodha connection status answers via chat, including handling expiry and disconnect scenarios.

**Independent Test**: Run the Playwright flow that completes login, asks “Am I logged in to Zerodha?”, validates the affirmative response, revokes the token, and confirms the logout message.

### Tests for User Story 3

- [ ] T020 [US3] Author Playwright spec `backend/tests/e2e/chat-zerodha-status.spec.ts` covering logged-in and logged-out responses

### Implementation for User Story 3

- [ ] T021 [US3] Implement `status` tool wrapper in `backend/src/agents/zerodha-agent/status.ts` to fetch session state via MCP
- [ ] T022 [US3] Extend `zerodhaStateRepository` to store access token metadata and expiry in `backend/src/services/persistence/zerodhaStateRepository.ts`
- [ ] T023 [US3] Reply with Zerodha status in `backend/src/routes/chat/router.ts` leveraging cached state and MCP fallback
- [ ] T024 [P] [US3] Present dynamic status pill in `frontend/components/chat/zerodha-status-pill.tsx`
- [ ] T025 [US3] Add disconnect handler in `backend/src/agents/zerodha-agent/index.ts` to degrade gracefully when MCP reports invalid session

**Checkpoint**: All user stories function independently; Zerodha-aware chat is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Harden logging, documentation, and fallback behavior across the feature.

- [ ] T026 [P] Capture structured broker interaction logs in `backend/src/logging/logger.ts` with correlation IDs
- [ ] T027 Document setup + test flow in `specs/001-zerodha-chat-connect/quickstart.md`
- [ ] T028 Implement MCP downtime fallback messaging in `backend/src/agents/zerodha-agent/index.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies – start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion – blocks all user stories.
- **User Stories (Phases 3-5)**: Each depends on Foundational completion. Execute sequentially in priority order (P1 → P2 → P3) unless team resourcing enables parallel work post-foundation.
- **Polish (Phase 6)**: Depends on completion of targeted user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Independent once Phase 2 completes.
- **User Story 2 (P2)**: Builds on User Story 1’s persistence and gateway but remains independently testable.
- **User Story 3 (P3)**: Requires authentication state from US2 but delivers distinct chat responses.

### Within Each User Story

- Tests (T008, T014, T020) must be written first and fail before implementation.
- Backend repositories/agents (T009, T015, T021) precede route/controller updates (T010, T017, T023).
- Frontend render tasks (T011, T012, T018, T019, T024) can run in parallel once backend payload is defined.
- Story-level checkpoints confirm independent shippable increments.

---

## Parallel Opportunities

- Tasks marked **[P]** (T011, T012, T018, T019, T024, T026) can be executed concurrently once their blocking dependencies are satisfied.
- After Phase 2, frontend and backend contributors can work in parallel on different user stories provided shared contracts are locked.
- Tests across stories can run concurrently once authored because they target separate flows.

---

## Execution Summary

- **Total tasks**: 28  
- **Per story**: US1 (6 tasks), US2 (6 tasks), US3 (6 tasks)  
- **Parallel-ready tasks**: 6 (all marked with `[P]`)
- **Independent test criteria**: Defined at the top of each user story phase
- **Suggested MVP scope**: Phases 1–3 (through User Story 1)
- **Format validation**: All tasks follow `- [ ] T### [P] [US#] Description with file path`

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Execute Phase 3 (User Story 1) and ensure Playwright spec passes
4. Demo the persisted chat experience before advancing

### Incremental Delivery

1. Ship MVP (US1)
2. Add Zerodha login prompts (US2) once MCP credentials verified
3. Layer conversational status checks (US3)
4. Apply polish tasks for observability and documentation

### Parallel Team Strategy

1. Team completes Setup + Foundational together
2. Post-foundation:
   - Developer A: User Story 1 + backend persistence hardening
   - Developer B: User Story 2 front/back integration
   - Developer C: User Story 3 status logic and tests
3. Reconvene for Polish tasks and regression validation

---

## Notes

- Keep frontend dumb: all decisions live in `backend/src`.
- Maintain zero `any` types and add comments only where logic is non-obvious.
- Log every Kite MCP interaction through `zerodhaAgent` channel for traceability.
- Verify Playwright specs fail before implementation to honor Red-Green-Refactor.

