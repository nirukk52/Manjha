# Manjha Constitution

## Core Principles

### I. Incremental, User-Facing First
Every feature must demonstrate tangible user value before expanding. Build the smallest functional slice that provides real portfolio insight or risk control. No infrastructure-only work without immediate user benefit. Focus beats scope.

### II. Spec-Driven, Red-Green-Refactor (NON-NEGOTIABLE)
Every feature starts with a spec. Review existing skills → Write spec → Write E2E test (Red) → Implement (Green) → Refactor → Update skills. Tests are flow-based: "Clicked this → That happened → It shows X → Gucci". TDD is mandatory.

### III. Strongly Typed, No Compromises
TypeScript with zero `any` types. Kotlin-style enums and type safety throughout. If you can't type it properly, redesign it. Frontend and backend must have explicit interfaces and contracts.

### IV. Agent-as-Service (Modular Intelligence)
Manjha is specialized agents: risk analyzer, portfolio explainer, chart generator, mental model builder. Each agent is independently testable, swappable, improvable. Clear boundaries between orchestration, analysis, visualization.

### V. Discipline Through Code
Risk features (max drawdown, VaR alerts, position limits) must be bulletproof. Test with edge cases. Fail-safe: err toward blocking trades, not allowing them. Risk prevention is non-negotiable.

## Technical Stack & Constraints

### Backend
- Encore.ts services (risk engine, portfolio analysis, market data)
- LangGraph for agent orchestration
- PostgreSQL for user state
- Common logging module: all logs in ONE place (no scattered console.log)
- Every external API: document costs, rate limits, degradation strategy

### Frontend
- Next.js + React + Tailwind + shadcn/ui
- Frontend is COMPLETELY DUMB: no business logic, pure presentation
- All intelligence lives in backend agents

### Testing
- E2E tests for user flows (required for every feature)
- Integration tests for API contracts
- Performance budget: chat < 2s, widget < 500ms

## File Organization

### No Floating Files
- Scripts: Must be in organized folders, not root
- Markdown: `/specs` OR `/bug`, `/tech-debt`, `/chore` folders ONLY
- > 4 files in a folder 2 levels deep → reorganize into subfolders

## Development Workflow

### Every Spec Lifecycle
1. **Start**: Review relevant skills from `.claude/skills`
2. **Build**: Red → Green → Refactor cycle
3. **End**: Update skills based on learnings

### Quality Gates
- No `any` types in TypeScript (enforced by linter)
- E2E test passes for user-facing behavior
- All backend operations logged via common module
- External API integrations have fallback behavior

## Governance

Constitution supersedes all practices. Features violating these principles must be explicitly justified or redesigned. When in doubt, refer back to Core Principles I-V.

Incremental delivery: Ship smallest valuable slice → Real users → Learn → Iterate.

**Version**: 1.0.0 | **Ratified**: 2025-11-21 | **Last Amended**: 2025-11-21
