# Implementation Plan: Zerodha Chat Connect

**Branch**: `001-zerodha-chat-connect` | **Date**: 2025-11-25 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-zerodha-chat-connect/spec.md`

**Note**: Plan outlines the high-level approach to integrate the hosted Kite MCP server into the chat experience while keeping frontend presentation dumb.

## Summary

Deliver a minimal, user-visible Zerodha integration by (1) persisting chat conversations keyed by frontend-provided `userId`, (2) surfacing broker connection status and prompts within chat responses, and (3) brokering all Zerodha actions through the hosted Kite MCP endpoint (`https://mcp.kite.trade/mcp`). The backend gains a dedicated `zerodha-agent` module that orchestrates Kite MCP tools (starting with `login`) and updates Supabase-backed session state; the frontend simply renders the returned status badge and CTA.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 (Encore.ts services)  
**Primary Dependencies**: Fastify + tRPC, LangGraph agent orchestrator, Supabase JS client, `mcp-remote` HTTP client for Kite MCP  
**Storage**: Supabase PostgreSQL (pooled `DATABASE_URL` for runtime, `DIRECT_URL` for migrations)  
**Testing**: Playwright E2E (“User clicked send → System did Y → UI shows Z → Gucci ✓”) plus Vitest for agent unit coverage  
**Target Platform**: Backend services on Encore runtime; frontend on Next.js 14 with Tailwind/shadcn  
**Project Type**: Dual workspace web app (`backend/`, `frontend/`)  
**Performance Goals**: ≤5s chat response P95 including MCP login prompt; status badge updates within one request cycle  
**Constraints**: No `any` types; all broker calls routed through Kite MCP; centralized logging via common module; graceful degradation when MCP unavailable  
**Scale/Scope**: Pilot release (<1k users) with persistent chat sessions and optional Zerodha linkage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Spec-first (Principle II)**: ✅ Spec approved at `specs/001-zerodha-chat-connect/spec.md`.
- **User-facing increment (Principle I)**: ✅ Delivers visible chat + broker status before deeper automation.
- **Red-Green-Refactor (Principle II)**: ✅ Plan begins with Playwright E2E to drive implementation; unit tests back agent logic.
- **Strong typing (Principle III)**: ✅ New modules expose explicit interfaces/enums; repo lint forbids `any`.
- **Agent boundaries (Principle IV)**: ✅ Zerodha functionality isolated via `zerodha-agent` invoking Kite MCP.
- **Logging discipline (Tech Stack)**: ✅ All broker interactions log through the common logging module with user correlation IDs.

## Project Structure

### Documentation (this feature)

```text
specs/001-zerodha-chat-connect/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── agents/
│   │   └── zerodha-agent/      # new: Kite MCP orchestration + status helpers
│   ├── routes/
│   │   └── chat/               # extend tRPC mutation with broker-aware responses
│   ├── services/
│   │   └── persistence/        # Supabase chat + session persistence utilities
│   └── logging/                # shared logging integrations (already centralized)
└── tests/
    ├── e2e/                    # Playwright flow: user chat with Zerodha prompt
    └── integration/            # Vitest for zerodha-agent behaviors

frontend/
├── app/
│   └── (chat pages)            # ensures dumb rendering of chat surface
├── components/
│   └── chat/                   # status badge, CTA button, message list
└── lib/
    └── api/                    # typed client hitting chat procedure
```

**Structure Decision**: Continue with the existing dual workspace (backend/frontend). Add a `zerodha-agent` module under `backend/src/agents/` and extend current chat route + components; no new top-level projects required.

## Complexity Tracking

No constitutional violations require escalation; table intentionally left empty.
