# Technical Plan: Finance Chat Agent with Smart Routing

**Feature**: 001-finance-chat-agent  
**Created**: 2025-11-21  
**Status**: Draft  
**Spec**: [spec.md](./spec.md)

## Skills Reviewed

- **Backend Development**: Encore.ts service patterns, TypeScript strong typing
- **Agent Orchestration**: LangGraph multi-agent patterns (per Constitution)
- **API Design**: Type-safe contracts, streaming patterns

## Overview

Build a **strongly-typed, scalable backend** that routes chat messages to specialized agents (finance or general) and streams responses in real-time. Frontend (existing chat-input.tsx) will be refined in Figma separately, then integrated via typed contracts.

## Architecture Principles

### 1. Zero `any` Types (NON-NEGOTIABLE)
- All interfaces explicitly typed
- Enums for agent types, message states, error codes
- Type guards for runtime validation
- Strict TypeScript compiler settings

### 2. Agent-as-Service Pattern
- Each agent is independently deployable Encore.ts service
- Clear boundaries: routing → agent selection → execution → response
- LangGraph orchestration for multi-agent coordination

### 3. Centralized Logging (ONE Place)
- Common logging module: `backend/common/logging/`
- All agent calls, routing decisions, latencies logged
- Structured logs with correlation IDs

### 4. Contracts-First Development
- Define TypeScript interfaces BEFORE implementation
- Frontend and backend develop against same types
- Versioned API contracts in `backend/contracts/`

## System Design

### High-Level Flow

```
User Message
    ↓
[Chat API Gateway] (Encore.ts endpoint)
    ↓
[Message Classifier Service] ← logs to common module
    ↓ (finance | general)
    ↓
[LangGraph Orchestrator]
    ├→ [Finance Agent Service] (OpenAI agent wrapper)
    └→ [General Agent Service] (lightweight model)
    ↓
[Streaming Response Service] ← logs streaming metrics
    ↓
Frontend (SSE/WebSocket)
```

### Core Services (Encore.ts)

#### 1. `chat-gateway` Service
**Purpose**: Single entry point for all chat messages, handles streaming setup

**Endpoints**:
- `POST /chat/send` - Send message, get agent response
- `GET /chat/stream/:sessionId` - SSE endpoint for real-time streaming

**Types**:
```typescript
enum AgentType {
  FINANCE = 'FINANCE',
  GENERAL = 'GENERAL'
}

enum MessageStatus {
  PENDING = 'PENDING',
  STREAMING = 'STREAMING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

interface ChatMessageRequest {
  sessionId: string;
  content: string;
  userId: string;
}

interface ChatMessageResponse {
  messageId: string;
  status: MessageStatus;
  agentType: AgentType;
  streamUrl: string;
}
```

#### 2. `message-classifier` Service
**Purpose**: Classify message as finance or general (< 500ms requirement)

**Endpoints**:
- `POST /classify` - Classify message intent

**Types**:
```typescript
interface ClassificationRequest {
  content: string;
  conversationHistory?: ChatMessage[];
}

interface ClassificationResult {
  agentType: AgentType;
  confidence: number; // 0.0 - 1.0
  reasoning: string; // for logging/debugging
  latencyMs: number;
}
```

**Implementation Strategy**:
- Fast keyword/regex heuristics first (< 50ms)
- LLM classification only for ambiguous cases
- Cache classification patterns (Redis future optimization)

#### 3. `finance-agent` Service
**Purpose**: Wrapper for OpenAI financial research agent

**Endpoints**:
- `POST /analyze` - Get financial analysis

**Types**:
```typescript
interface FinanceQuery {
  question: string;
  userId: string;
  portfolioContext?: PortfolioContext;
}

interface FinanceResponse {
  answer: string;
  confidence: number;
  sources: string[];
  processingTimeMs: number;
}

interface PortfolioContext {
  holdings: Holding[];
  transactions: Transaction[];
  // Defined in backend/contracts/portfolio.types.ts
}
```

**Integration**:
- Python OpenAI agent runs as subprocess or separate service
- Node.js wrapper handles Encore.ts → Python communication
- Streaming from Python agent forwarded to frontend

#### 4. `general-agent` Service
**Purpose**: Lightweight agent for non-finance queries

**Endpoints**:
- `POST /respond` - Get general response

**Types**:
```typescript
interface GeneralQuery {
  question: string;
  maxTokens: number; // keep responses short
}

interface GeneralResponse {
  answer: string;
  processingTimeMs: number;
}
```

**Implementation**:
- Use free/cheap model (GPT-3.5-turbo or similar)
- Max 100 tokens for concise responses
- < 2s response time requirement

#### 5. `agent-orchestrator` Service (LangGraph)
**Purpose**: Coordinate multi-agent workflows, handle complex queries

**Endpoints**:
- `POST /orchestrate` - Execute multi-step agent workflows

**Types**:
```typescript
enum WorkflowStep {
  CLASSIFY = 'CLASSIFY',
  EXECUTE_FINANCE = 'EXECUTE_FINANCE',
  EXECUTE_GENERAL = 'EXECUTE_GENERAL',
  STREAM_RESPONSE = 'STREAM_RESPONSE',
  COMPLETE = 'COMPLETE'
}

interface OrchestrationState {
  currentStep: WorkflowStep;
  classification: ClassificationResult;
  agentResponse?: FinanceResponse | GeneralResponse;
  error?: AgentError;
}
```

**LangGraph Implementation**:
- Define state graph: Classify → Execute → Stream → Complete
- Error handling at each node
- Retry logic for transient failures

#### 6. `common-logging` Module (NOT a service)
**Purpose**: Centralized logging for all services using Encore's built-in logging

**Location**: Encore's native `log` module + helper utilities in `backend/common/logging/`

**Implementation**:
```typescript
// Use Encore's native structured logging
import log from "encore.dev/log";

// Helper for agent call logging
export function logAgentCall(
  agentType: AgentType,
  query: string,
  latencyMs: number,
  success: boolean,
  metadata?: Record<string, unknown>
): void {
  log.info("agent_call", {
    agent_type: agentType,
    latency_ms: latencyMs,
    success,
    query_length: query.length,
    ...metadata
  });
}

// Helper for classification logging
export function logClassification(
  result: ClassificationResult,
  metadata?: Record<string, unknown>
): void {
  log.info("classification", {
    agent_type: result.agentType,
    confidence: result.confidence,
    latency_ms: result.latencyMs,
    ...metadata
  });
}
```

**Logging Requirements** (from Constitution):
- All logs use Encore's native `log` module (automatic correlation IDs)
- Structured JSON logs with type-safe key-value pairs
- View logs via `encore logs` command (local dev and production)
- Agent latency metrics logged automatically
- No scattered `console.log` anywhere

### Database Schema (PostgreSQL)

```typescript
// backend/contracts/database.types.ts

interface ChatSession {
  id: string; // UUID
  userId: string;
  createdAt: Date;
  lastActivityAt: Date;
  status: 'ACTIVE' | 'IDLE' | 'ARCHIVED';
}

interface ChatMessage {
  id: string; // UUID
  sessionId: string; // FK to ChatSession
  sender: 'USER' | 'AGENT';
  content: string;
  agentType?: AgentType;
  status: MessageStatus;
  timestamp: Date;
  latencyMs?: number;
  errorDetails?: string;
}

interface AgentMetrics {
  id: string; // UUID
  agentType: AgentType;
  timestamp: Date;
  latencyMs: number;
  success: boolean;
  errorCode?: string;
  userId: string;
}
```

**Migrations**: `backend/chat-gateway/migrations/`
- `001_create_chat_sessions.up.sql`
- `002_create_chat_messages.up.sql`
- `003_create_agent_metrics.up.sql`

## API Contracts (Frontend ↔ Backend)

**Location**: `backend/contracts/api.types.ts`

```typescript
// Shared types between frontend and backend
export enum AgentType {
  FINANCE = 'FINANCE',
  GENERAL = 'GENERAL'
}

export enum MessageStatus {
  PENDING = 'PENDING',
  STREAMING = 'STREAMING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ChatMessageRequest {
  sessionId: string;
  content: string;
}

export interface ChatMessageResponse {
  messageId: string;
  status: MessageStatus;
  agentType: AgentType;
  streamUrl: string; // SSE endpoint
}

export interface StreamChunk {
  type: 'DELTA' | 'COMPLETE' | 'ERROR';
  content?: string; // partial response text
  error?: ApiError;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  retryable: boolean;
}

export enum ErrorCode {
  CLASSIFICATION_FAILED = 'CLASSIFICATION_FAILED',
  AGENT_TIMEOUT = 'AGENT_TIMEOUT',
  AGENT_ERROR = 'AGENT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}
```

## Streaming Strategy

### Option A: Server-Sent Events (SSE) - RECOMMENDED
**Why**: Simpler, built-in browser support, one-way stream (sufficient for our use case)

```typescript
// Backend (Encore.ts raw endpoint)
export const streamResponse = api.raw(
  { expose: true, path: "/chat/stream/:sessionId", method: "GET" },
  async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const { sessionId } = req.params;
    
    // Stream from agent
    for await (const chunk of agentResponseStream(sessionId)) {
      const data: StreamChunk = { type: 'DELTA', content: chunk };
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'COMPLETE' })}\n\n`);
    res.end();
  }
);
```

```typescript
// Frontend (chat-input.tsx update)
const eventSource = new EventSource(`/chat/stream/${sessionId}`);

eventSource.onmessage = (event) => {
  const chunk: StreamChunk = JSON.parse(event.data);
  
  if (chunk.type === 'DELTA') {
    // Append to UI in real-time
    updateStreamingMessage(chunk.content);
  } else if (chunk.type === 'COMPLETE') {
    eventSource.close();
    setIsLoading(false);
  }
};
```

### Option B: WebSocket
Use if bidirectional communication needed later (e.g., user can interrupt agent mid-response)

## Implementation Phases

### Phase 1: Foundation & Contracts (P1) - Week 1
**Goal**: Type-safe foundation, no `any` types

- [ ] Set up Encore.ts backend structure
- [ ] Create `backend/contracts/` with all TypeScript interfaces
- [ ] Implement `common-logging` helpers (wrapping Encore's `log` module)
- [ ] Configure TypeScript strict mode, linter rules (no `any`)
- [ ] Install type utilities: `type-fest` for advanced TypeScript patterns
- [ ] Set up PostgreSQL migrations (Encore auto-managed)
- [ ] Write contract integration tests

**Deliverable**: Fully typed contracts, shared between FE/BE

**Type Safety Stack**:
- **type-fest**: Advanced TypeScript utilities (keep dependencies lean)
- **Strict tsconfig.json**: `"strict": true`, `"noImplicitAny": true`
- **ESLint rules**: Enforce no `any`, prefer `unknown` for uncertain types

### Phase 2: Core Services (P1) - Week 1-2
**Goal**: Working agent routing and classification

- [ ] Implement `chat-gateway` service with SSE streaming
- [ ] Implement `message-classifier` service (heuristics + LLM fallback)
- [ ] Implement `general-agent` service (lightweight model)
- [ ] Add logging to all services via common module
- [ ] Write unit tests for each service

**Deliverable**: Classification + general agent working

### Phase 3: Finance Agent Integration (P1) - Week 2
**Goal**: OpenAI financial research agent integrated

- [ ] Create Python subprocess wrapper in `finance-agent` service
- [ ] Integrate OpenAI financial research agent
- [ ] Implement streaming from Python → Node.js → Frontend
- [ ] Add portfolio context injection
- [ ] Test with sample portfolio data

**Deliverable**: Finance agent answering portfolio questions

### Phase 4: LangGraph Orchestration (P2) - Week 3
**Goal**: Multi-agent coordination for complex queries

- [ ] Implement LangGraph state graph
- [ ] Add error handling and retry logic
- [ ] Implement workflow monitoring
- [ ] Add circuit breakers for agent failures
- [ ] Configure LangGraph Studio for visual debugging

**Deliverable**: Robust orchestration layer with visual debugging

**LangGraph Studio Setup**:
- Visual graph debugger for state machine
- Time-travel debugging through workflow steps
- Real-time visualization of agent decision paths
- URL: https://github.com/langchain-ai/langgraph-studio

### Phase 5: Integration & Testing (P1) - Week 3
**Goal**: Frontend ↔ Backend connected, E2E tests passing

- [ ] Sync updated Figma design to frontend
- [ ] Connect frontend to SSE streaming endpoints
- [ ] Write E2E tests: "User sends finance question → Agent responds → Gucci"
- [ ] Performance testing (< 3s finance, < 2s general, < 100ms UI)
- [ ] Load testing (50 messages per session)

**Deliverable**: Feature complete, tests green

## Testing Strategy

### Unit Tests (Per Service)
```typescript
// backend/message-classifier/classifier.test.ts
describe('MessageClassifier', () => {
  it('classifies finance question correctly', async () => {
    const result = await classifier.classify({
      content: 'Why is my P&L negative?'
    });
    
    expect(result.agentType).toBe(AgentType.FINANCE);
    expect(result.confidence).toBeGreaterThan(0.9);
    expect(result.latencyMs).toBeLessThan(500);
  });
});
```

### Integration Tests
```typescript
// backend/chat-gateway/gateway.integration.test.ts
describe('Chat Gateway Integration', () => {
  it('routes finance message to finance agent', async () => {
    const response = await client.chatGateway.send({
      sessionId: 'test-session',
      content: 'What is my sector exposure?'
    });
    
    expect(response.agentType).toBe(AgentType.FINANCE);
    expect(response.streamUrl).toBeDefined();
  });
});
```

### E2E Tests (Per Spec)
```typescript
// tests/e2e/finance-chat.spec.ts
test('User asks finance question → Finance agent responds → Gucci', async ({ page }) => {
  await page.goto('/');
  
  // Send message
  await page.fill('[data-testid="chat-input"]', 'Why is my P&L negative this month?');
  await page.click('[data-testid="send-button"]');
  
  // Message appears immediately (< 100ms)
  await expect(page.locator('[data-testid="user-message"]')).toBeVisible({ timeout: 100 });
  
  // Agent starts responding (< 3s)
  await expect(page.locator('[data-testid="agent-response"]')).toBeVisible({ timeout: 3000 });
  
  // Response streams in real-time
  const responseText = await page.locator('[data-testid="agent-response"]').textContent();
  expect(responseText).toContain('portfolio'); // Finance context
  
  // Check agent type logged
  const logs = await getBackendLogs();
  expect(logs).toContainEqual(expect.objectContaining({
    agentType: 'FINANCE',
    success: true
  }));
});
```

## Error Handling Strategy

### Error Types (Enum)
```typescript
enum ErrorCode {
  CLASSIFICATION_FAILED = 'CLASSIFICATION_FAILED',
  AGENT_TIMEOUT = 'AGENT_TIMEOUT',
  AGENT_ERROR = 'AGENT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT'
}

interface AgentError {
  code: ErrorCode;
  message: string;
  retryable: boolean;
  agentType?: AgentType;
}
```

### Retry Logic
- Classification failure → Retry once, fallback to general agent
- Finance agent timeout (> 10s) → Return cached/default response
- Network error → Retry with exponential backoff (max 3 attempts)
- All errors logged via common module

### Graceful Degradation
- Finance agent down → Route to general agent with disclaimer
- General agent down → Show friendly error, allow retry
- Streaming fails → Fallback to non-streaming response

## Performance Targets (from Spec)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Classification latency | < 500ms | Log in classifier service |
| Finance agent first token | < 3s | Log in finance-agent service |
| General agent response | < 2s | Log in general-agent service |
| UI message display | < 100ms | Frontend performance.now() |
| Streaming smoothness | 60fps | No dropped frames |
| Concurrent sessions | 50+ | Load testing |

## Deployment Considerations

### Environment Configuration (Encore-Native Approach)

**Secrets Management** (use Encore's built-in secrets):
```bash
# Set secrets via Encore CLI (encrypted, environment-specific)
encore secret set --type local OpenAIAPIKey
encore secret set --type prod OpenAIAPIKey
```

```typescript
// backend/finance-agent/agent.ts
import { secret } from "encore.dev/config";

const openAIKey = secret("OpenAIAPIKey");

// Use in code (type-safe)
const apiKey = openAIKey();
```

**Database** (Encore auto-manages):
```typescript
// backend/chat-gateway/db.ts
import { SQLDatabase } from "encore.dev/storage/sqldb";

// Encore provisions PostgreSQL automatically (no manual DATABASE_URL)
const db = new SQLDatabase("manjha", {
  migrations: "./migrations",
});
```

**Configuration Constants** (type-safe config):
```typescript
// backend/common/config/constants.ts
export const CONFIG = {
  CLASSIFICATION_TIMEOUT_MS: 500,
  FINANCE_AGENT_TIMEOUT_MS: 10000,
  GENERAL_AGENT_TIMEOUT_MS: 2000,
} as const;
```

### Encore.ts Deployment
- Services auto-deploy via Encore Cloud
- PostgreSQL provisioned automatically per environment
- Secrets encrypted and managed via `encore secret` CLI
- Logs accessible via `encore logs --env=prod --json`

## Future Optimizations (Not in MVP)

- [ ] Redis cache for classification patterns
- [ ] Agent response caching for common queries
- [ ] WebSocket for bidirectional communication
- [ ] Rate limiting per user
- [ ] A/B testing different classification strategies
- [ ] Multi-agent collaboration (finance + risk agent)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| OpenAI agent is slow (> 10s) | Poor UX | Implement timeout, show progress indicator |
| Classification is inaccurate | Wrong agent used | Log confidence scores, allow user to re-route |
| Streaming breaks on network issue | Response lost | Fallback to polling, persist state in DB |
| Python subprocess crashes | Finance agent unavailable | Health checks, auto-restart, circuit breaker |

## Success Criteria (from Spec)

- [x] All services strongly typed (zero `any`)
- [x] Common logging module captures all agent calls
- [x] API contracts defined and versioned
- [x] E2E tests cover P1 user stories
- [x] Performance targets met (< 3s, < 2s, < 100ms)
- [x] Scalable architecture for future agents

---

**Next Steps**:
1. Review and approve this plan
2. Start Phase 1: Foundation & Contracts
3. Parallel work: You refine Figma, I build backend
4. Sync at Phase 5: Integration & Testing

