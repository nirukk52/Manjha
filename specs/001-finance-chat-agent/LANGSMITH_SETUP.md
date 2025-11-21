# LangSmith Setup for Agent Debugging

LangSmith provides complete observability for your finance agent, showing:
- **Agent execution traces** - See every step of the agent's reasoning
- **LLM calls** - View prompts sent and responses received
- **Token usage** - Track costs and performance
- **Classification decisions** - Understand why queries route to FINANCE vs GENERAL

## Quick Setup (5 minutes)

### 1. Ensure OpenAI Key is Set (Required)

```bash
# First, set your OpenAI API key for local development
echo "your-openai-key" | encore secret set --type local OpenAIApiKey

# Verify
encore secret list
```

**Important**: Use `--type local` for local development!

### 2. Create LangSmith Account (Optional - for tracing)
1. Go to https://smith.langchain.com/
2. Sign up (free tier available)
3. Get your API key from Settings → API Keys

### 3. Set LangSmith Environment Variables

**Option A: Via Environment Variables (Recommended for LangGraph Studio)**

```bash
# Set these in your shell or .env file in backend/agent-orchestrator directory
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="ls__your_api_key"
export LANGSMITH_PROJECT="manjha-finance-agent"
```

**Option B: Via .env file**

Create `.env` in `backend/agent-orchestrator` directory:
```bash
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=ls__your_key_here
LANGSMITH_PROJECT=manjha-finance-agent
```

### 4. Restart Encore

```bash
# Stop current instance
pkill -f "encore run"

# Start with secrets
encore run
```

Wait for: `"Encore development server running!"`

## What You'll See in LangSmith

After making a request, go to https://smith.langchain.com/:

1. **Traces Tab** - See all agent executions
2. **Click a trace** - View:
   - Input query
   - System prompt used
   - LLM response
   - Token counts (input/output/total)
   - Latency
   - Model used

## Testing

1. Test the streaming endpoint:
```bash
./tests/e2e/test-stream.sh
```

**Expected output:**
```
🚀 Full E2E Flow (Send → Stream)
📤 Step 1: Creating message...
✅ Message ID: abc-123-...
📥 Step 2: Streaming response...
[Agent response streams here...]
✅ Stream completed
```

2. Check LangSmith dashboard (if enabled):
   - Go to https://smith.langchain.com/
   - Click "Traces" tab
   - You should see a new trace appear for your query!

3. If streaming works but no traces appear in LangSmith:
   - Verify `LANGSMITH_TRACING=true` is set
   - Check `LANGSMITH_API_KEY` is correct (starts with `ls__`)
   - Restart Encore after setting environment variables

## Troubleshooting

**No traces showing?**
- Check `LANGSMITH_TRACING=true` is set (not `LANGCHAIN_TRACING_V2`)
- Verify `LANGSMITH_API_KEY` is correct and starts with `ls__`
- Restart Encore after setting env vars

**Want to trace classification too?**
- Update `message-classifier/classifier.ts` to use LangChain ChatOpenAI

## Benefits

✅ **Debug agent failures** - See exactly where it fails
✅ **Optimize prompts** - Test different system prompts
✅ **Track costs** - Monitor token usage per query
✅ **Understand routing** - See why classification chose FINANCE vs GENERAL

