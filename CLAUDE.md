# Manjha Development Guidelines

# Instructions for Using Graphiti's MCP Tools
## Graphiti MCP group_id to be used is "manjha"

## Before Starting Any Task
- Always search first: Use the **search_nodes** tool to look for relevant preferences and procedures before beginning work.  
- Search for facts too: Use the **search_facts** tool to discover relationships and factual information that may be relevant to your task.  
- Filter by entity type: Specify `"Preference"` or `"Procedure"` in your node search to get targeted results.  
- Review all matches: Carefully examine any preferences, procedures, or facts that match your current task.  
- Always save new or updated information.  
- Capture requirements immediately: When a user expresses a requirement or preference, use **add_episode** to store it right away. Split long requirements into smaller chunks.  
- Be explicit if something is an update to existing knowledge.  
- Document procedures clearly: When you discover how a user wants things done, record it as a procedure.  
- Record factual relationships: When you learn about connections between entities, store these as facts.  
- Be specific with categories: Label preferences and procedures with clear categories for better retrieval later.

---

## During Your Work
- Respect discovered preferences: Align your work with any preferences you've found.  
- Follow procedures exactly: If you find a procedure for your current task, follow it step by step.  
- Apply relevant facts: Use factual information to inform your decisions and recommendations.  
- Stay consistent: Maintain consistency with previously identified preferences, procedures, and facts.

---

## Best Practices
- Search before suggesting: Always check if there's established knowledge before making recommendations.  
- Combine node and fact searches: For complex tasks, search both nodes and facts to build a complete picture.  
- Use **center_node_uuid**: When exploring related information, center your search around a specific node.  
- Prioritize specific matches: More specific information takes precedence over general information.  
- Be proactive: If you notice patterns in user behavior, consider storing them as preferences or procedures.  
- Remember: The knowledge graph is your memory. Use it consistently to provide personalized assistance that respects the user's established procedures and factual context.

## Core Reminder
**The knowledge graph is your memory. Use it consistently to deliver personalized, context-aware assistance.**


## Identity
You're working with a **Kotlin engineer** who values strong typing, enums, and zero tolerance for `any` types.

## Skills-First Development
- **Before every task**: Review relevant skills from `.claude/skills`
- **After every task**: Update skills with learnings
- Always use `.claude/skills/skill-creator` to create new skills
- Always use `.claude/skills/mcp-builder` to create new MCPs

## Tech Stack

### Backend
- **Framework**: Encore.ts (all services)
- **Agent Orchestration**: LangGraph
- **Database**: PostgreSQL
- **Logging**: Common logging module (all logs in ONE place)

### Frontend
- **Framework**: Next.js + React
- **Styling**: Tailwind + shadcn/ui
- **Philosophy**: COMPLETELY DUMB - no business logic, pure presentation

## Development Process (NON-NEGOTIABLE)

### 1. Spec-Driven Development
Every feature starts with a spec in `/specs` folder.

### 2. Red-Green-Refactor TDD
- **Red**: Write E2E test that fails
- **Green**: Implement feature until test passes
- **Refactor**: Clean up while keeping tests green

### 3. E2E Tests for Flows
Test format: "User clicked X → System did Y → UI shows Z → Gucci ✓"

## Type Safety Rules

### Absolutely NO `any` Types
- Use explicit interfaces and types
- Prefer enums over string unions
- Kotlin-style strong typing throughout
- Linter must enforce this

## File Organization

### No Floating Files
- **Scripts**: Organized folders only (not root)
- **Markdown**: `/specs` OR `/bug`, `/tech-debt`, `/chore` folders ONLY
- **Golden Rule**: > 4 files in folder 2 levels deep → create subfolders

## Architecture Principles

### Frontend: Dumb Presentation Layer
All business logic, intelligence, and decisions live in backend agents.

### Backend: Agent-as-Service
Modular agents: risk analyzer, portfolio explainer, chart generator, mental model builder.

### Logging: Centralized & Complete
Everything logged through common logging module. No scattered `console.log`.

### External APIs
Document: costs, rate limits, fallback behavior, degradation strategy.

## Quality Gates
- ✓ No `any` types (linter enforced)
- ✓ E2E test passes
- ✓ Proper logging via common module
- ✓ Spec exists in `/specs`
- ✓ Skills reviewed and updated

## Reference
See `.specify/memory/constitution.md` for the holy Constitution.