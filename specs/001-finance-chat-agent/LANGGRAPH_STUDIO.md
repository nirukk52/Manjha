# LangGraph Studio Setup

## Quick Start

### 1. Install LangGraph CLI
```bash
npm install -g @langchain/langgraph-cli
```

Or with pip:
```bash
pip install langgraph-cli
```

### 2. Set Environment Variables

Create `.env` file in `backend/agent-orchestrator/`:
```bash
OPENAI_API_KEY=your-openai-key-here
```

Or use existing Encore secret:
```bash
# Get your OpenAI key from Encore
encore secret list

# Copy the value and create .env
echo "OPENAI_API_KEY=sk-proj-..." > .env
```

### 3. Start LangGraph Studio

From the `backend/agent-orchestrator/` directory:
```bash
langgraph dev
```

This will:
- Start LangGraph Studio server
- Open browser at http://localhost:8123
- Auto-reload on code changes

### 4. View the Graph

In the browser, you'll see:
- **Graph Visualization**: Visual representation of agent workflow
  - `classify` node (entry point)
  - Conditional routing
  - `execute_finance` and `execute_general` nodes
  - End states

- **Run Tab**: Test the graph with queries
- **History Tab**: View past executions
- **Traces Tab**: Deep dive into execution details

## Graph Structure

```
         START
           ↓
      [classify]
           ↓
    (conditional routing)
      ↙         ↘
[execute_finance]  [execute_general]
      ↓              ↓
     END            END
```

## Testing in Studio

### Finance Query
```json
{
  "query": "What is portfolio diversification?",
  "userId": "test-user"
}
```

Should route through:
1. classify → `agentType: "FINANCE"`
2. execute_finance → detailed response
3. END

### General Query
```json
{
  "query": "Hello, how are you?",
  "userId": "test-user"
}
```

Should route through:
1. classify → `agentType: "GENERAL"`
2. execute_general → brief response
3. END

## Features

### State Inspection
- View state at each node
- See how `agentType`, `confidence`, `response` evolve
- Debug classification decisions

### Trace Analysis
- Token usage per LLM call
- Latency breakdown
- Error traces

### Live Editing
- Modify `graph.ts`
- Studio auto-reloads
- Test changes immediately

## Troubleshooting

### "Cannot find module"
Make sure you're in `backend/agent-orchestrator/`:
```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha/backend/agent-orchestrator
langgraph dev
```

### "OpenAI API key not set"
Create `.env` file:
```bash
echo "OPENAI_API_KEY=$(encore secret get OpenAIApiKey)" > .env
```

### Graph doesn't update
- Save `graph.ts`
- Studio should auto-reload
- Check terminal for errors

## Next Steps: Multi-Agent Workflows

Extend the graph with:
1. **Planner Node**: Break complex queries into sub-tasks
2. **Search Node**: Web/data retrieval
3. **Analyst Nodes**: Financial metrics, risk analysis
4. **Writer Node**: Report generation
5. **Verifier Node**: Quality check

See `backend/financial_research_agent/` (Python) for reference implementation.

## Resources

- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [LangGraph Studio](https://github.com/langchain-ai/langgraph-studio)
- [State Management](https://langchain-ai.github.io/langgraph/concepts/low_level/#state)
- [Conditional Routing](https://langchain-ai.github.io/langgraph/how-tos/branching/)

