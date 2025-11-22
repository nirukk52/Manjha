# Agent Orchestrator

Multi-agent workflow orchestration using LangGraph.

## Configuration

### Environment Variables

The following environment variables are required and configured in `.env`:

- `OPENAI_API_KEY` - Your OpenAI API key (also stored in Encore as `OpenAIApiKey` secret)
- `LANGSMITH_TRACING` - Enable/disable LangSmith tracing (`true`/`false`)
- `LANGSMITH_API_KEY` - Your LangSmith API key for observability
- `LANGSMITH_PROJECT` - LangSmith project name (default: `manjha-finance-agent`)

### Dependency Chain

This service works in two contexts:

1. **LangGraph Studio** - Uses `.env` file for configuration
2. **Encore Service** - Uses Encore secrets via `orchestrator.ts`

Both contexts are maintained without breaking changes:
- `graph.ts` - Pure TypeScript, no Encore dependencies (for LangGraph Studio)
- `orchestrator.ts` - Encore service wrapper (uses Encore secrets)

### LangSmith Tracing

View your agent traces at: https://smith.langchain.com/

Traces include:
- Agent execution flow
- LLM calls with prompts/responses
- Token usage and costs
- Classification decisions
- Latency metrics

## Development

### Running with LangGraph Studio

1. Ensure `.env` file exists with all required keys
2. Run the startup script which loads environment variables:
   ```bash
   ./start-langgraph.sh
   ```
3. Open Studio UI at: https://smith.langchain.com/studio?baseUrl=http://localhost:2024

**Important**: LangGraph CLI requires environment variables to be exported in the shell.
The `start-langgraph.sh` script handles this automatically.

### Running with Encore

```bash
# From backend directory
encore run
```

Encore will use secrets configured via:
```bash
encore secret set --type local OpenAIApiKey
```

## Architecture

```
┌─────────────────────────────────────────┐
│         graph.ts (Pure TS)              │
│   ┌─────────────────────────────────┐   │
│   │  State Graph Definition         │   │
│   │  - Classify Node               │   │
│   │  - Finance Node                │   │
│   │  - General Node                │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  ▲
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────┴──────┐         ┌─────┴──────┐
│ LangGraph  │         │  Encore    │
│  Studio    │         │  Service   │
│  (.env)    │         │ (secrets)  │
└────────────┘         └────────────┘
```

## Testing

Run the E2E test:
```bash
cd ../tests/e2e
./test-stream.sh
```

Expected: Agent responds + traces appear in LangSmith dashboard.
