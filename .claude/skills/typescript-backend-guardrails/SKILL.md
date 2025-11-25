name: typescript-backend-guardrails
description: Codifies Manjha's TypeScript backend guardrails. Use when planning or reviewing Fastify/tRPC services, defining schemas, configuring tooling, or stress-testing backend readiness.
---

# TypeScript Backend Guardrails

## Overview
Manjha is re-platforming backend services from Encore to a **Fastify + TypeBox + tRPC** stack. This skill packages the guardrails that keep the platform strongly typed, schema-driven, and production-ready while enabling rapid iteration.

## When To Use This Skill
- Designing a new backend domain service or plugin.
- Reviewing pull requests that touch backend APIs, schemas, or infrastructure.
- Auditing environment/tooling configuration (`tsconfig`, linting, build scripts).
- Stress-testing performance, error handling, or observability plans.

## Core Guardrails

### 1. Schema-Driven Contracts
- Define every public contract with **TypeBox** so runtime validation and static inference stay aligned.

```typescript
import { Static, Type } from '@sinclair/typebox'

export const TradeNote = Type.Object({
  id: Type.String({ format: 'uuid' }),
  body: Type.String({ minLength: 1 }),
  tags: Type.Array(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
})

export type TradeNoteModel = Static<typeof TradeNote>
```

- When writing raw JSON schema, remember `as const` so nested keys remain literal.

```typescript
const importJobSchema = {
  type: 'object',
  properties: {
    filename: { type: 'string' },
    broker: { type: 'string', enum: ['zerodha', 'robinhood'] },
    dryRun: { type: 'boolean', default: false },
  },
  required: ['filename', 'broker'],
} as const
```

### 2. Fastify Platform Practices
- Wrap cross-cutting concerns in Fastify plugins; register via `decorate*` only when a declaration merge is in place.

```typescript
import fastify from 'fastify'

declare module 'fastify' {
  interface FastifyReply {
    requestId: string
  }
}

const app = fastify()
app.decorateReply('requestId', '')
```

- Use route generics for typed `Reply`, `Body`, `Querystring`, and `Headers`. Avoid `any` escape hatches—strong typing is mandatory.

### 3. tRPC Procedure Graph
- Compose procedures with **tRPC + Zod** to inherit types end-to-end. Organize routers by domain (e.g., `journal`, `risk`, `insights`).

```typescript
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

const t = initTRPC.create()

export const journalRouter = t.router({
  upsert: t.procedure
    .input(z.object({ noteId: z.string().uuid(), body: z.string().min(1) }))
    .mutation(({ input }) => saveNote(input)),
  list: t.procedure
    .input(z.object({ traderId: z.string().uuid() }))
    .query(({ input }) => loadNotes(input.traderId)),
})
```

- Favor caller factories for agent-side access and httpBatchLink for UI clients to keep caching predictable.

### 4. Tooling Baseline
- Enforce strict `tsconfig` boundaries—compile only `src/` and exclude generated/build output.

```json5
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "node16",
    "verbatimModuleSyntax": true
  },
  "include": ["src"],
  "exclude": ["**/node_modules", "**/.*/", "dist"]
}
```

- Keep ESLint, pino logging, and Vitest/Playwright harnesses aligned with contracts; failing tests must block merges.

### 5. Data + Observability
- Model persistence with Prisma; surface transaction requirements and isolation levels per operation.
- Route all logs and metrics through the common logging module; expose Fastify hooks for request lifecycle tracing.
- Load test critical routes using k6/Artillery before shipping new agent flows.

## Implementation Checklist
1. Capture the domain contract in TypeBox/JSON schema + unit tests.
2. Map contract to Prisma models/migrations; document invariants.
3. Build Fastify plugin(s) with typed decorations and register health hooks.
4. Layer tRPC routers for agents/UI; wire httpBatchLink + caller factories.
5. Verify `tsconfig`, lint, and test configs; ensure `pnpm test` and `pnpm run lint` are green.
6. Document operational runbook (logging, retries, rate limits) before release.

## References
- `references/guardrail-notes.md` summarizes contextual snippets (TypeBox, Fastify decoration, tRPC router patterns, tsconfig layout) sourced from upstream documentation.
- Link Fastify plugin examples, Prisma data guides, and load-testing scripts here as they are added.

## Resources

This skill includes example resource directories that demonstrate how to organize different types of bundled resources:

### scripts/
Executable code (Python/Bash/etc.) that can be run directly to perform specific operations.

**Examples from other skills:**
- PDF skill: `fill_fillable_fields.py`, `extract_form_field_info.py` - utilities for PDF manipulation
- DOCX skill: `document.py`, `utilities.py` - Python modules for document processing

**Appropriate for:** Python scripts, shell scripts, or any executable code that performs automation, data processing, or specific operations.

**Note:** Scripts may be executed without loading into context, but can still be read by Claude for patching or environment adjustments.

### references/
Documentation and reference material intended to be loaded into context to inform Claude's process and thinking.

**Examples from other skills:**
- Product management: `communication.md`, `context_building.md` - detailed workflow guides
- BigQuery: API reference documentation and query examples
- Finance: Schema documentation, company policies

**Appropriate for:** In-depth documentation, API references, database schemas, comprehensive guides, or any detailed information that Claude should reference while working.

### assets/
Files not intended to be loaded into context, but rather used within the output Claude produces.

**Examples from other skills:**
- Brand styling: PowerPoint template files (.pptx), logo files
- Frontend builder: HTML/React boilerplate project directories
- Typography: Font files (.ttf, .woff2)

**Appropriate for:** Templates, boilerplate code, document templates, images, icons, fonts, or any files meant to be copied or used in the final output.

---

**Any unneeded directories can be deleted.** Not every skill requires all three types of resources.
