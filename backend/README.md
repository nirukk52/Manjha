# Manjha Finance Chat Agent - Backend

TypeScript backend for the finance chat agent powered by Encore.ts, OpenAI GPT-4, and LangGraph.

## Architecture

### Services

```
chat-gateway/          → Entry point for chat messages + SSE streaming
message-classifier/    → Routes messages to finance vs general agent  
finance-agent/         → Specialized financial analysis (GPT-4)
general-agent/         → Quick responses for non-finance queries (GPT-3.5)
agent-orchestrator/    → LangGraph multi-agent workflow coordination
```

### Flow

```
User Message
    ↓
[Chat Gateway] → Validates, stores message
    ↓
[Classifier] → Finance or General? (< 500ms)
    ↓
[Agent] → Generate response (Finance: < 3s, General: < 2s)
    ↓
[SSE Stream] → Real-time chunks to frontend
```

## Setup

### Prerequisites
- Node.js 20+
- Encore CLI: `brew install encoredev/tap/encore`
- OpenAI API key

### Installation

```bash
cd backend
npm install
```

### Configure Secrets

```bash
# Local development
encore secret set --type local OpenAIApiKey

# Production
encore secret set --type prod OpenAIApiKey
```

### Run Development Server

```bash
encore run
```

The API will be available at: `http://localhost:4000`

## API Endpoints

### `POST /chat/send`
Submit a chat message.

**Request:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "What is my P&L this month?",
  "userId": "user-123"
}
```

**Important**: `sessionId` must be a valid UUID. Generate one:
- JavaScript: `crypto.randomUUID()`
- Online: https://www.uuidgenerator.net/
- Command line: `uuidgen` (macOS/Linux)

**Response:**
```json
{
  "messageId": "uuid",
  "status": "PENDING",
  "agentType": "FINANCE",
  "streamUrl": "/chat/stream/session-id/message-id?agentType=FINANCE&query=..."
}
```

### `GET /chat/stream/:sessionId/:messageId`
Stream agent response via Server-Sent Events (SSE).

**Response Format:**
```
data: {"type":"DELTA","content":"The "}
data: {"type":"DELTA","content":"P&L is..."}
data: {"type":"COMPLETE"}
```

## Database Schema

### Tables

**chat_sessions**
- id (UUID)
- user_id (TEXT)
- created_at (TIMESTAMP)
- last_activity_at (TIMESTAMP)
- status (ENUM: ACTIVE, IDLE, ARCHIVED)

**chat_messages**
- id (UUID)
- session_id (UUID FK)
- sender (ENUM: USER, AGENT)
- content (TEXT)
- agent_type (ENUM: FINANCE, GENERAL)
- status (ENUM: PENDING, STREAMING, COMPLETE, ERROR)
- timestamp (TIMESTAMP)
- latency_ms (INTEGER)
- error_details (TEXT)

**agent_metrics**
- id (UUID)
- agent_type (ENUM: FINANCE, GENERAL)
- timestamp (TIMESTAMP)
- latency_ms (INTEGER)
- success (BOOLEAN)
- error_code (TEXT)
- user_id (TEXT)

### Database Commands

```bash
# Access database shell
encore db shell chat

# View migrations
encore db migrations list

# View connection string
encore db conn-uri chat
```

## Testing

### Run E2E Tests

```bash
encore test
```

**CRITICAL**: Always use `encore test`, NOT `npm test`. The `encore test` command properly initializes the Encore runtime environment.

### Manual SSE Test

```bash
# Send message
curl -X POST http://localhost:4000/chat/send \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test","content":"What is risk management?","userId":"test"}'

# Stream response (copy streamUrl from above)
curl -N http://localhost:4000/chat/stream/...
```

## Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Classification | < 500ms | Logged in classifier service |
| Finance agent first token | < 3s | SSE first DELTA event |
| General agent response | < 2s | Complete response time |
| UI message display | < 100ms | Frontend responsibility |

## Type Safety

**Zero `any` types** - enforced by ESLint:

```bash
npm run lint        # Check for type errors
npm run type-check  # TypeScript compilation check
```

All types defined in `contracts/api.types.ts` are shared with frontend.

## Logging

All logs use Encore's native `log` module via helpers in `common/logging/logger.ts`.

View logs:
```bash
# Local development
encore logs

# Production
encore logs --env=prod --json
```

Log structure:
- `agent_call` - Agent invocations with latency
- `classification` - Routing decisions
- `streaming_event` - SSE streaming lifecycle
- `api_call` - HTTP request metrics
- `application_error` - Error events

## Configuration

All constants in `common/config/constants.ts`:
- Timeout values
- Model selection
- Classification keywords
- Rate limits (future)

## Deployment

### Encore Cloud

```bash
# Deploy to Encore Cloud
git push encore main

# View deployment
encore app open
```

Encore automatically:
- Provisions PostgreSQL database
- Configures secrets
- Sets up logging and monitoring
- Generates API documentation

### Environment Management

```bash
# Create new environment
encore env create staging

# Set secrets per environment
encore secret set --env staging OpenAIApiKey
```

## LangGraph Orchestration

The `agent-orchestrator` service uses LangGraph for multi-agent workflows:

1. **CLASSIFY** - Determine routing
2. **EXECUTE** - Run finance or general agent
3. **STREAM** - Deliver response to client
4. **COMPLETE** - Log metrics

Currently simplified for MVP. Future enhancements:
- Multi-step planning (planner → searcher → writer)
- Verification agent
- Source attribution
- Confidence scoring

## MVP Limitations

1. **No Portfolio Integration**: Finance agent provides general analysis
2. **Stubbed Auth**: userId = 'anonymous'
3. **Basic Classification**: Keyword heuristics + LLM fallback
4. **No Rate Limiting**: Enforcement deferred to post-MVP

## Future Enhancements

- [ ] Portfolio data integration via Kite API
- [ ] Advanced LangGraph workflows (planning, verification)
- [ ] Redis caching for classification
- [ ] WebSocket support for bidirectional communication
- [ ] Rate limiting per user
- [ ] User authentication integration

## Troubleshooting

### "error serializing parameter 0: unable to parse uuid"
**Cause**: Invalid `sessionId` format when testing via Encore dashboard

**Solution**: Use a valid UUID for `sessionId`:
```bash
# Generate a UUID
uuidgen

# Or use this example:
# 550e8400-e29b-41d4-a716-446655440000
```

### "OpenAI API Error"
Check secret is set: `encore secret list`

### "Database connection failed"
Ensure migrations ran: `encore db migrations list`

### "Classification timeout"
Check OpenAI API latency or increase `TIMEOUTS.CLASSIFICATION_MS`

### "Tests failing"
1. Use `encore test` (NOT `npm test`)
2. Check OpenAI API key is valid (optional for most tests)
3. Verify database is accessible

## Contributing

Per Constitution:
- **No `any` types** - ESLint enforced
- **Centralized logging** - Use `common/logging/logger.ts`
- **Strong typing** - All interfaces in `contracts/`
- **TDD approach** - E2E tests first
- **Comments required** - Explain WHY code exists

## Support

- Encore Docs: https://encore.dev/docs
- OpenAI API: https://platform.openai.com/docs
- LangGraph: https://langchain-ai.github.io/langgraph/
