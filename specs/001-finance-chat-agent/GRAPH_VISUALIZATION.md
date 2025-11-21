# Agent Orchestration Workflow Graph

## Visual Flow Diagram

```
         START
           ↓
      ┌─────────┐
      │classify │  ← Determines if query is FINANCE or GENERAL
      │  (LLM)  │     Uses GPT-3.5-turbo
      └────┬────┘
           │
      ┌────┴────┐
      ↓         ↓
 FINANCE?    GENERAL?
      ↓         ↓
┌─────────┐ ┌──────────┐
│execute_ │ │execute_  │
│finance  │ │general   │
│(GPT-4)  │ │(GPT-4)   │
└────┬────┘ └────┬─────┘
     │           │
     └──────┬────┘
            ↓
           END
```

## Nodes

### 1. **classify**
- **Function**: `classifyQuery(state)`
- **Model**: GPT-3.5-turbo
- **Purpose**: Analyze query and route to appropriate agent
- **Output**: 
  - `agentType`: FINANCE or GENERAL
  - `confidence`: 0.8 (fixed for MVP)

### 2. **execute_finance**
- **Function**: `executeFinanceAgent(state)`
- **Model**: GPT-4-turbo-preview
- **Purpose**: Detailed financial analysis
- **Max Tokens**: 1500
- **Response Time**: ~2-5s

### 3. **execute_general**
- **Function**: `executeGeneralAgent(state)`
- **Model**: GPT-4-turbo-preview
- **Purpose**: Quick general responses
- **Max Tokens**: 100
- **Response Time**: ~0.5-2s

## State Flow

### Input State
```typescript
{
  query: "What is portfolio diversification?",
  userId: "user-123"
}
```

### After Classification
```typescript
{
  query: "What is portfolio diversification?",
  userId: "user-123",
  agentType: "FINANCE",        // ← Added
  confidence: 0.8               // ← Added
}
```

### Final State
```typescript
{
  query: "What is portfolio diversification?",
  userId: "user-123",
  agentType: "FINANCE",
  confidence: 0.8,
  response: "Portfolio diversification...",  // ← Added
  processingTimeMs: 3247                     // ← Added
}
```

## Routing Logic

```typescript
function routeToAgent(state: OrchestrationState): string {
  if (state.agentType === AgentType.FINANCE) {
    return "execute_finance";
  }
  return "execute_general";
}
```

## Example Traces

### Finance Query
```
Query: "What is my P&L this month?"
  ↓ classify
    → agentType: FINANCE (keywords: "P&L")
  ↓ execute_finance
    → GPT-4 detailed response (1247 tokens, 4.2s)
  ↓ END
Response: "To analyze your P&L for this month..."
```

### General Query
```
Query: "Hello, how are you?"
  ↓ classify
    → agentType: GENERAL (no finance keywords)
  ↓ execute_general
    → GPT-4 brief response (23 tokens, 0.8s)
  ↓ END
Response: "Hello! I'm here to help..."
```

## Metrics & Observability

Each node logs:
- **Input**: State at node entry
- **Processing Time**: Node execution duration
- **Output**: State modifications
- **Errors**: Any failures with stack traces

View in:
- **Encore Logs**: `encore logs`
- **LangSmith** (if configured): Full trace with token counts
- **LangGraph Studio** (planned): Visual execution flow

## Future Extensions

### Multi-Agent Workflow (Phase 6+)
```
      START
        ↓
    [classify]
        ↓
   ┌────┴────┐
   ↓         ↓
[SIMPLE]  [COMPLEX]
   ↓         ↓
[execute] [planner]
          ↓
      [search_web]
          ↓
   ┌──────┴──────┐
   ↓             ↓
[analyst_     [analyst_
 financial]    risk]
   ↓             ↓
   └──────┬──────┘
          ↓
      [writer]
          ↓
     [verifier]
          ↓
         END
```

See `backend/financial_research_agent/` (Python reference) for full implementation.

## Testing the Workflow

### Via Orchestrator API
```bash
curl -X POST http://localhost:4000/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is portfolio diversification?",
    "userId": "test-user"
  }'
```

### Via Test Script
```typescript
import { runOrchestration } from './graph.js';

const result = await runOrchestration({
  query: "What is portfolio diversification?",
  userId: "test-user"
});

console.log(result.response);
```

## Performance

| Node | Avg Latency | Model | Max Tokens |
|------|-------------|-------|------------|
| classify | ~200ms | GPT-3.5 | 10 |
| execute_finance | ~3-5s | GPT-4 | 1500 |
| execute_general | ~0.5-2s | GPT-4 | 100 |

**Total E2E**: 3-7 seconds for finance queries, 1-3 seconds for general queries

