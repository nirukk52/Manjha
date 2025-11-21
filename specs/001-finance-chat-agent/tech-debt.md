# Technical Debt: Finance Chat Agent

**Feature**: 001-finance-chat-agent  
**Created**: 2025-11-21  
**Last Updated**: 2025-11-21  
**Priority**: High (blocks advanced multi-agent workflows)

## Overview

This document tracks technical debt accumulated during the MVP implementation of the finance chat agent. These items are deferred to enable rapid delivery but must be addressed before Phase 6 (Advanced Multi-Agent Workflows).

---

## 🚨 Critical Tech Debt

### TD-001: Orchestrator Not Integrated with Streaming

**Status**: Open  
**Priority**: P0 (Blocks multi-agent)  
**Effort**: 3-5 days  
**Related Code**: `backend/chat-gateway/gateway.ts:170`, `backend/agent-orchestrator/graph.ts`

**Problem**:
The LangGraph orchestrator exists but is NOT used in the streaming path. The `/stream` endpoint directly calls individual agents, bypassing orchestration entirely.

```typescript
// Current: Direct agent call (line 170)
for await (const chunk of analyzeStreaming({ question: query })) {
  res.write(...);
}

// Should be: Orchestrated workflow
for await (const event of runOrchestrationStreaming({ query })) {
  res.write(...);
}
```

**Impact**:
- Cannot do multi-step agent workflows
- No visibility into agent reasoning/planning
- Blocks planner → searcher → analyst → writer pipeline
- No tool calling support

**Resolution Path**:
1. Convert `runOrchestration()` to async generator
2. Yield events at each workflow step
3. Update `/stream` to route through orchestrator
4. Expand `StreamChunk` types for workflow events

**Blocked Features**:
- Multi-step financial research
- Planner agent
- Verification agent
- Tool calling framework

---

### TD-002: No Human-in-the-Loop Support

**Status**: Open  
**Priority**: P1  
**Effort**: 8-10 days  
**Related Code**: SSE architecture, `gateway.ts:133-274`

**Problem**:
SSE (Server-Sent Events) is one-way communication only. Agent cannot pause to ask clarifying questions or wait for user input mid-workflow.

**Example Blocked Scenarios**:
```
Agent: "I found 3 investment strategies. Which interests you?"
  1. Conservative growth
  2. Aggressive tech
  3. Balanced diversification
[User cannot respond - no input channel]
```

**Impact**:
- No clarification questions
- No user preferences during analysis
- No confirmation prompts
- Limited interactivity

**Resolution Options**:

**Option A: WebSocket Upgrade (Recommended)**
- Full bidirectional communication
- Effort: 8-10 days
- Best for complex workflows

**Option B: Hybrid (SSE + POST endpoint)**
- SSE for streaming, POST for input
- Effort: 5-7 days
- Simpler but requires polling

**Option C: Defer to Phase 6**
- Keep SSE for now
- Design around limitation
- Effort: 0 days (defer)

**Recommendation**: Defer to Phase 6 unless product explicitly needs interactive agents.

---

### TD-003: Orphaned User Messages

**Status**: Open  
**Priority**: P2  
**Effort**: 2 days  
**Related Code**: `gateway.ts:37-120`, database schema

**Problem**:
If user calls `/send` but never connects to `/stream`, the agent never runs. This leaves "orphaned" USER messages in the database with no corresponding AGENT response.

**Current Behavior**:
```sql
-- After /send only
SELECT * FROM chat_messages WHERE sender='USER';
-- Returns: "What is diversification?" (status=COMPLETE)

SELECT * FROM chat_messages WHERE sender='AGENT';  
-- Returns: Nothing! Agent never called.
```

**Additional Issues**:
- Response status "PENDING" only exists in API response, not persisted
- Cannot query for "unanswered questions"
- Cannot trigger background processing
- Wasted classification work

**Resolution Path**:
1. Add `message_status` table to track lifecycle
2. Persist "PENDING" status in database
3. Add background job to process orphaned messages
4. Or: Accept as feature (lazy evaluation)

**Trade-offs**:
- **Keep lazy**: Don't waste OpenAI calls if user closes browser
- **Add background**: Better UX, can show "previous answers"

**Decision Needed**: Is lazy evaluation acceptable or add background processing?

---

## ⚠️ High Priority Tech Debt

### TD-004: Limited State Management for Multi-Step Workflows

**Status**: Open  
**Priority**: P1  
**Effort**: 3 days  
**Related Code**: `agent-orchestrator/graph.ts:28-43`

**Problem**:
`OrchestrationState` is too simple for complex multi-agent workflows. Missing:

```typescript
// Current state (too simple)
interface OrchestrationState {
  query: string;
  agentType?: AgentType;  // Only 1 agent!
  response?: string;       // Only 1 response!
}

// Needed for multi-agent
interface OrchestrationState {
  query: string;
  
  // Multi-step tracking
  plan?: string[];                    // ["fetch", "analyze", "report"]
  currentStep?: number;               // 2 of 5
  intermediateResults?: Map<string, any>;  // Partial results
  
  // Tool support
  toolCalls?: ToolCall[];
  toolResults?: Map<string, any>;
  
  // Resume capability
  checkpointId?: string;
  
  response?: string;
}
```

**Impact**:
- Cannot track multi-step progress
- Cannot store intermediate results
- Cannot resume from checkpoint
- No tool call history

**Resolution Path**:
1. Expand `OrchestrationState` interface
2. Add state persistence layer
3. Implement checkpoint/resume logic
4. Update logging to track state changes

---

### TD-005: No Tool/Function Calling Framework

**Status**: Open  
**Priority**: P1  
**Effort**: 5-7 days  
**Related Code**: New `backend/tools/` directory needed

**Problem**:
Agents cannot call external functions/APIs. Everything is pure LLM text generation. Cannot:
- Fetch real portfolio data
- Get live stock prices
- Call calculation functions (Sharpe ratio, beta)
- Query external APIs (news, market data)

**Example Blocked Workflow**:
```
User: "What's my risk-adjusted return?"

Agent thinking: "I need to:"
1. Get user's portfolio holdings  ← NO TOOL
2. Fetch historical prices        ← NO TOOL  
3. Calculate Sharpe ratio          ← NO TOOL
4. Format results

Agent falls back to: "I cannot access your portfolio data..."
```

**Resolution Path**:
1. Create `backend/tools/` directory
2. Define tool interface:
   ```typescript
   interface Tool {
     name: string;
     description: string;
     parameters: JsonSchema;
     execute: (args: any) => Promise<any>;
   }
   ```
3. Register tools with orchestrator
4. Update LLM calls to support function calling
5. Handle tool execution in workflow

**Tools Needed**:
- `getPortfolioHoldings(userId)`
- `getStockPrice(symbol)`
- `calculateSharpeRatio(returns)`
- `fetchNewsForStock(symbol)`
- `getMarketData(date)`

---

### TD-006: No Stream Event Types for Multi-Agent

**Status**: Open  
**Priority**: P1  
**Effort**: 2 days  
**Related Code**: `contracts/api.types.ts:68-75`

**Problem**:
`StreamChunk` only supports basic text streaming. Cannot communicate agent workflow events:

```typescript
// Current (too simple)
export interface StreamChunk {
  type: 'DELTA' | 'COMPLETE' | 'ERROR';
  content?: string;
  error?: ApiError;
}

// Needed for multi-agent visibility
export type StreamChunk =
  | { type: 'AGENT_START'; agent: string; step: number; total: number }
  | { type: 'AGENT_THINKING'; thought: string; agent: string }
  | { type: 'TOOL_CALL'; tool: string; args: any }
  | { type: 'TOOL_RESULT'; tool: string; result: any; duration_ms: number }
  | { type: 'DELTA'; content: string }
  | { type: 'PLAN_CREATED'; steps: string[] }
  | { type: 'VERIFICATION_PASSED'; checks: string[] }
  | { type: 'COMPLETE' }
  | { type: 'ERROR'; error: ApiError };
```

**Impact**:
- Frontend cannot show "Agent is planning..."
- No progress indicators for long workflows
- Cannot display tool calls ("Fetching stock prices...")
- Poor UX for multi-step research

**Resolution Path**:
1. Expand `StreamChunk` discriminated union
2. Update frontend to handle new event types
3. Emit events from orchestrator at each step
4. Add progress tracking UI

---

## 📋 Medium Priority Tech Debt

### TD-007: No Checkpoint/Resume Capability

**Status**: Open  
**Priority**: P2  
**Effort**: 5 days

**Problem**:
Long workflows cannot be checkpointed or resumed. If connection drops or agent crashes at step 5/10, must restart from scratch.

**Resolution Path**:
1. Add `workflow_checkpoints` table
2. Serialize state at each step
3. Add `/stream/resume` endpoint
4. Implement state recovery logic

---

### TD-008: One Agent Type Per Message

**Status**: Open  
**Priority**: P2  
**Effort**: 3 days

**Problem**:
Classification assigns single `AgentType` (FINANCE or GENERAL). Cannot route to multiple agents in sequence.

**Blocked Scenario**:
```
User: "Explain bonds and show my bond holdings"
Needs: [ExplainerAgent, DataFetcherAgent]
Current: Can only pick one
```

**Resolution Path**:
1. Change `agentType` to `agentTypes: AgentType[]`
2. Update orchestrator to handle multiple agents
3. Implement agent sequencing logic

---

### TD-009: No Conversation Context in Agent Calls

**Status**: Open  
**Priority**: P2  
**Effort**: 2 days  
**Related Code**: `gateway.ts:170`, `finance-agent/agent.ts:26`

**Problem**:
Each agent call is stateless. Agent doesn't see conversation history, so cannot:
- Reference previous answers
- Build on prior analysis
- Maintain conversation context

**Example**:
```
User: "What's my risk exposure?"
Agent: "Your portfolio has 60% equity..."

User: "Is that too high?"  
Agent: "Is what too high?" ← No memory of "60% equity"
```

**Resolution Path**:
1. Pass `conversationHistory` to agents
2. Store recent messages in session
3. Include context in LLM prompts

---

### TD-010: Missing Agent Performance Metrics

**Status**: Open  
**Priority**: P2  
**Effort**: 2 days

**Problem**:
Limited observability into agent behavior:
- No token usage tracking per agent
- No cost attribution
- No quality metrics
- No A/B testing framework

**Resolution Path**:
1. Expand `agent_metrics` table with token counts, costs
2. Add quality scoring (user feedback)
3. Implement A/B testing framework
4. Build agent performance dashboard

---

## 🔧 Low Priority Tech Debt

### TD-011: Hard-Coded Agent Configuration

**Status**: Open  
**Priority**: P3  
**Effort**: 1 day  
**Related Code**: `common/config/constants.ts:43-54`

**Problem**:
Agent models, tokens, and prompts are hard-coded. Cannot:
- A/B test different models
- Adjust per user (enterprise vs free tier)
- Toggle features via config

**Resolution Path**:
1. Move config to database
2. Add admin UI for agent configuration
3. Support per-user/per-tier overrides

---

### TD-012: No Rate Limiting

**Status**: Open  
**Priority**: P3  
**Effort**: 2 days

**Problem**:
No rate limiting on `/send` or `/stream`. Users can spam requests, waste OpenAI credits.

**Resolution Path**:
1. Add rate limiting middleware
2. Use Redis for distributed rate limits
3. Define limits per user tier

---

### TD-013: Generic Error Messages

**Status**: Open  
**Priority**: P3  
**Effort**: 1 day

**Problem**:
Error messages are generic: "Failed to process message". Not actionable for users or debugging.

**Resolution Path**:
1. Define error code taxonomy
2. Add user-friendly error messages
3. Include retry guidance
4. Log detailed errors for debugging

---

## 📊 Summary

| Priority | Count | Total Effort |
|----------|-------|--------------|
| P0 (Critical) | 1 | 3-5 days |
| P1 (High) | 5 | 25-32 days |
| P2 (Medium) | 5 | 19 days |
| P3 (Low) | 3 | 4 days |
| **Total** | **14 items** | **51-60 days** |

---

## 🎯 Recommended Resolution Order

### Phase 1: Enable Multi-Agent (Sprint 1-2)
1. **TD-001**: Integrate orchestrator with streaming
2. **TD-006**: Add workflow event types
3. **TD-004**: Expand state management

**Deliverable**: Basic sequential multi-agent workflows

### Phase 2: Tool Framework (Sprint 3-4)
4. **TD-005**: Build tool calling framework
5. **TD-009**: Add conversation context

**Deliverable**: Agents can call tools and maintain context

### Phase 3: Robustness (Sprint 5)
6. **TD-003**: Handle orphaned messages
7. **TD-007**: Add checkpoint/resume
8. **TD-010**: Improve observability

**Deliverable**: Production-ready multi-agent system

### Phase 4: Advanced Features (Future)
9. **TD-002**: Human-in-the-loop (if needed)
10. **TD-008**: Multi-agent routing
11. Remaining P3 items

---

## 🔍 References

- LangGraph docs: https://langchain-ai.github.io/langgraph/
- Encore streaming: https://encore.dev/docs/ts/primitives/streaming
- OpenAI function calling: https://platform.openai.com/docs/guides/function-calling

---

## 📝 Notes

- **TD-002 Decision Needed**: Defer human-in-the-loop or build now?
- **TD-003 Decision Needed**: Keep lazy evaluation or add background jobs?
- Many items can be worked in parallel by separate developers
- Estimated timeline: 2-3 months for full resolution

