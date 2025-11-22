# Backend Development Skill for Manjha

This skill provides comprehensive guidance for backend development in the Manjha project using Encore.ts, LangGraph, and PostgreSQL.

## When to Use This Skill

Use this skill when:
- Creating new Encore.ts services or agents
- Writing E2E tests for backend flows
- Implementing message classification or agent orchestration
- Working with the database schema
- Setting up logging or configuration
- Debugging backend issues
- Ensuring type safety across services

## What This Skill Contains

### SKILL.md
The main skill file containing:
- Core development principles (TDD, type safety, logging)
- Architecture overview
- E2E test development guidelines
- Service creation workflow
- Agent development patterns
- Quality gates and checklists

### References Directory

Detailed reference materials with concrete examples:

#### 1. testing-patterns.md
- E2E test structure templates
- User story test patterns
- Performance test patterns
- Edge case handling
- Integration test examples
- Database test patterns
- Encore-specific testing patterns

#### 2. encore-service-patterns.md
- Service structure and organization
- API endpoint patterns
- Service communication patterns
- Database query patterns
- Error handling patterns
- Agent service structure
- Logging and configuration patterns

#### 3. type-safety-patterns.md
- Zero-`any` rule enforcement
- Contract-driven development
- Enum patterns and usage
- Interface documentation standards
- Type guards and discriminated unions
- Generic type patterns
- Database type mapping

#### 4. langgraph-agent-patterns.md
- LangGraph workflow structure
- State management patterns
- Agent execution patterns
- Conditional routing
- Multi-step research workflows
- Error handling and retries
- Logging and metrics
- Integration with Encore

## How to Use This Skill

### Before Starting Development
1. Read the relevant reference file(s) for your task
2. Review the SKILL.md for the workflow
3. Check existing code in the codebase for patterns

### During Development
1. Follow the Red-Green-Refactor TDD cycle
2. Reference the patterns as you implement
3. Validate against the quality gates checklist
4. Use the logging patterns throughout

### After Development
1. Run the E2E tests
2. Check type safety (no `any` types)
3. Verify logging is through common module
4. Update the skill if you discovered new patterns

## Quality Gates

Every backend change must:
- ✓ Have a spec in `/specs`
- ✓ Have E2E test(s) that pass
- ✓ Use proper logging via common module
- ✓ Have zero `any` types (linter enforced)
- ✓ Follow file organization rules

## File Organization

```
.claude/skills/backend-dev/
├── SKILL.md                                  # Main skill file
├── README.md                                 # This file
└── references/                               # Detailed patterns
    ├── testing-patterns.md                   # E2E testing
    ├── encore-service-patterns.md            # Service development
    ├── type-safety-patterns.md               # Type safety rules
    └── langgraph-agent-patterns.md           # Agent orchestration
```

## Updating This Skill

When you discover new patterns or improvements:
1. Update the relevant reference file
2. Add a note in SKILL.md if it's a core pattern
3. Update this README if the structure changes
4. Document the "why" behind the pattern

## Related Skills

- **frontend-dev**: For Next.js/React frontend development
- **mcp-builder**: For creating Model Context Protocol servers
- **skill-creator**: For creating new skills

## Philosophy

This skill embodies Manjha's development philosophy:
- **Spec-driven**: Every feature starts with a spec
- **TDD**: Red-Green-Refactor cycle
- **Type-safe**: Zero tolerance for `any` types
- **Observable**: Comprehensive logging
- **User-focused**: Test USER-FACING behavior

## Quick Reference

### Running Tests
```bash
cd backend
encore test                 # ONLY correct command (initializes Encore runtime)
```

**NEVER use `npm test` directly** - it will fail because Encore runtime environment won't be initialized.

## Frontend ↔ Backend Integration
- The Next.js frontend talks to Encore through `frontend/lib/api-client.ts`, which enforces `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_API_TIMEOUT` before calling `/chat/send` and the SSE stream endpoints.
- Streaming replies are consumed via `getStreamingUrl(...)`, so monitoring or debugging connection issues usually begins in this shared client layer.

## Encore MCP Deployment Quickstart
- Install the Encore CLI (`brew install encoredev/tap/encore` on macOS or the steps from https://encore.dev/docs/get-started) and confirm `encore` works locally.
- Start Encore’s MCP server (`encore mcp start`) when you need the backend runtime exposed to Model Context Protocol tools or debugging instrumentation.
- Push to Encore Cloud with `git push encore main`; the managed platform provisions Postgres, secrets, logs, and the GPT-powered agents automatically and offers a free tier for rapid prototyping.
- Use `encore secret set --env=prod OpenAIApiKey` plus `encore env create` if you need separate environments (staging/production) while keeping the free tier happy by staying within its quotas.

### Creating a New Service
```bash
cd backend
mkdir new-service
cd new-service
# Create encore.service.ts
# Create [service-name].ts
# Add to contracts/api.types.ts
```

### Common Imports
```typescript
import { api } from "encore.dev/api";
import { Service } from "encore.dev/service";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { logger } from "../common/logging/logger";
import { AGENT_CONFIG } from "../common/config/constants";
```

## Version History

- **v1.0.0** (2024-11): Initial creation with comprehensive patterns from existing codebase

