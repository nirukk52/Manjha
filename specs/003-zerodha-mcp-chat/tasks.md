# Tasks: Zerodha MCP Chat Integration

**Input**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)  
**Branch**: `003-zerodha-mcp-chat`

## Task Format

`[ID] [Priority] Description`
- **P1** = MVP (must ship)
- **P2** = Post-MVP enhancement
- **P3** = Nice to have

---

## Phase 1: Backend zerodha-agent Service

**Goal**: Create Encore service that wraps Kite MCP

- [ ] **T1** [P1] Create `zerodha-agent` Encore service scaffold
  - `backend/zerodha-agent/encore.service.ts`
  - `backend/zerodha-agent/db.ts` with SQLDatabase
  - Basic folder structure

- [ ] **T2** [P1] Database migration for zerodha_sessions
  - `backend/zerodha-agent/migrations/001_create_zerodha_sessions.up.sql`
  - Fields: device_id, mcp_session_id, expires_at, status, zerodha_user_id, zerodha_user_name

- [ ] **T3** [P1] MCP HTTP client
  - `backend/zerodha-agent/mcp-client.ts`
  - Call `mcp.kite.trade/mcp` via HTTP POST
  - Handle MCP JSON-RPC protocol

- [ ] **T4** [P1] Login endpoint
  - `POST /zerodha.login`
  - Calls MCP `login` tool → returns OAuth URL
  - Creates PENDING session in DB

- [ ] **T5** [P1] Status endpoint
  - `POST /zerodha.status`
  - Calls MCP `get_profile` tool
  - Returns `{ isConnected, userName, expiresAt }`

**Checkpoint**: Backend can generate OAuth URL and verify connection ✓

---

## Phase 2: Frontend Integration

**Goal**: Wire existing popup to backend endpoints

- [ ] **T6** [P1] Update `handleZerodhaConnect` in chat-panel.tsx
  - Replace fake `/zerodha/oauth/initiate` call
  - Call `/zerodha.login` endpoint
  - Open returned `loginUrl` in popup window

- [ ] **T7** [P1] Add status polling after OAuth
  - Poll `/zerodha.status` when OAuth window closes
  - Or detect `?connected=true` URL param
  - Update `connectorStatus` state

- [ ] **T8** [P1] Update connector button UI
  - Show "Connected ✓" when `isConnected=true`
  - Display `userName` if available
  - Green indicator styling

**Checkpoint**: User can click Connect → OAuth → See "Connected" ✓ (MVP COMPLETE)

---

## Phase 3: Portfolio Queries

**Goal**: Enable actual Zerodha data in chat

- [ ] **T9** [P2] Implement `/zerodha.call` proxy endpoint
  - Generic MCP tool proxy
  - Supported tools: `get_holdings`, `get_positions`, `get_profile`, `get_orders`
  - Validate active session before calling

- [ ] **T10** [P2] Wire finance-agent to zerodha-agent
  - Detect @Zerodha in chat context
  - Route portfolio questions to zerodha-agent
  - Format MCP response for display

**Checkpoint**: "Show my holdings" with @Zerodha returns real data ✓

---

## Phase 4: Session Persistence

**Goal**: Returning users stay connected

- [ ] **T11** [P3] Auto-check session on page load
  - Check localStorage for previous `device_id`
  - Call `/zerodha.status` on mount
  - Pre-populate "Connected" state

- [ ] **T12** [P3] Handle session expiry gracefully
  - Detect 6h+ expired sessions
  - Clear stale state
  - Show "Session expired, reconnect" prompt

**Checkpoint**: Close browser, return within 6h, still connected ✓

---

## Dependency Graph

```
T1 → T2 → T3 → T4 ─┬─→ T6 → T7 → T8 → T11 → T12
                   │
                   └─→ T5 ─┘
                   │
                   └─→ T9 → T10
```

## Summary

| Priority | Tasks | Delivers |
|----------|-------|----------|
| **P1 MVP** | T1-T8 | Connect flow works end-to-end |
| **P2** | T9-T10 | Portfolio queries with real data |
| **P3** | T11-T12 | Session persistence UX |

**Total**: 12 tasks  
**MVP**: 8 tasks  
**Recommended order**: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8

