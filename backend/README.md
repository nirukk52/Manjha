# Manjha Finance Chat Agent - Backend

TypeScript backend for the finance chat agent powered by **Encore.ts** and **LangGraph**.

## Architecture

**All agents are built using LangGraph** - providing state management, tool calling, and multi-step reasoning capabilities.

### Services

```
chat-gateway/          → Entry point for chat messages + SSE streaming
agents/                → LangGraph-based agent system
  ├── graphs/          → Agent state graphs (finance, general, research)
  ├── nodes/           → Reusable graph nodes (classify, execute, stream)
  └── tools/           → Agent tools (Kite API, portfolio, etc.)
```

### Flow

```
User Message
    ↓
[Chat Gateway] → Validates, stores message
    ↓
[LangGraph Router] → Classify & route to appropriate agent graph
    ↓
[Agent Graph] → Multi-step reasoning with tools
    ↓
[SSE Stream] → Real-time chunks to frontend
```

### Why LangGraph?

- **State Management**: Persistent conversation state across turns
- **Tool Calling**: Structured integration with Kite API, portfolio data
- **Multi-step Reasoning**: Complex queries broken into sub-tasks
- **Observability**: Full tracing via LangSmith
- **Streaming**: Native support for SSE token streaming

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

## MVP Limitations

1. **No Portfolio Integration**: Finance agent provides general analysis
2. **Stubbed Auth**: userId = 'anonymous'
3. **Basic Classification**: Keyword heuristics + LLM fallback
4. **No Rate Limiting**: Enforcement deferred to post-MVP

## LangGraph Development

### Local Development with LangGraph Studio

```bash
# Set environment variables
export LANGSMITH_API_KEY="your-key"
export LANGSMITH_TRACING="true"
export OPENAI_API_KEY="your-key"

# Run with tracing
encore run
```

View traces at: https://smith.langchain.com/

### Adding New Agent Graphs

1. Define state schema in `agents/graphs/`
2. Create nodes in `agents/nodes/`
3. Wire up graph with conditional edges
4. Register in chat-gateway router

## Future Enhancements

- [ ] Portfolio data integration via Kite API tools
- [ ] Research agent with web search capabilities
- [ ] Multi-agent supervisor for complex queries
- [ ] Redis checkpointing for conversation state
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
