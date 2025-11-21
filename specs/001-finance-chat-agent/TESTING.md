# Backend Testing Guide

## Quick Test Scripts

### Full E2E Flow Test (Recommended)
Tests the complete flow: send message → stream response

```bash
./tests/e2e/test-stream.sh
```

**What it does:**
1. Generates a new UUID session
2. Calls `/chat/send` to create a message
3. Uses the returned `streamUrl` to stream the agent's response
4. Pretty-prints the streaming chunks in real-time

### Automated E2E Tests (Vitest)
Run all E2E tests:

```bash
encore test
```

**Important**: Always use `encore test` (NOT `npm test`). This ensures:
- Encore runtime is available
- Secrets are accessible
- Database is connected
- Services can communicate

## Setup Requirements

### 1. OpenAI API Key
The finance agent requires an OpenAI API key:

```bash
# Set for local development
echo "your-api-key-here" | encore secret set --type local OpenAIApiKey

# Verify it's set
encore secret list
```

**Common Issue**: If you see `"warning: secrets not defined: OpenAIApiKey"`, you need to set it with `--type local`.

### 2. Start Encore
```bash
encore run
```

Wait for: `"Encore development server running!"` message.

### 3. Run Tests
```bash
# Quick manual test
./tests/e2e/test-stream.sh

# Full automated suite
encore test
```

## Test Scripts Reference

### `tests/e2e/test-stream.sh`
- **Usage**: `./test-stream.sh [sessionId] [messageId] [agentType] [query]`
- **Default**: Full E2E flow (no args needed)
- **Features**:
  - Auto-generates UUIDs
  - Pretty-prints streaming chunks
  - Shows errors with details
  - Works with or without `jq` installed

### `tests/e2e/test-full-flow.sh`
More verbose version with detailed logging:

```bash
./tests/e2e/test-full-flow.sh [sessionId] [query]
```

## Expected Output

### Successful Stream
```
🚀 Full E2E Flow (Send → Stream)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 Step 1: Creating message...
✅ Message ID: abc-123-...

📥 Step 2: Streaming response...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Portfolio diversification is a risk management strategy...
[streaming content continues...]
✅ Stream completed
```

### Common Errors

#### "secret OpenAIApiKey is not set"
**Fix**: Set the secret with `--type local`:
```bash
echo "your-key" | encore secret set --type local OpenAIApiKey
encore run  # Restart Encore
```

#### "Failed to process message"
**Causes**:
- Encore not running
- Database not migrated
- Invalid sessionId format (must be UUID)

**Fix**:
```bash
encore run
# Wait for "Encore development server running!"
```

#### "Connection refused"
**Cause**: Encore not started
**Fix**: Run `encore run` and wait ~10 seconds

## Testing with LangSmith (Optional)

For detailed agent observability, see `LANGSMITH_SETUP.md`.

Once configured, every agent call will be traced in LangSmith dashboard showing:
- Full prompt/response
- Token usage
- Latency breakdown
- Classification decisions

## Manual Testing via Encore Dashboard

1. Open: http://127.0.0.1:9400
2. Navigate to: `chat-gateway` → `send`
3. Use this request body:

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "What is portfolio diversification?",
  "userId": "test-user"
}
```

4. Copy the `streamUrl` from response
5. Open in browser or curl:
```bash
curl "http://localhost:4000<streamUrl>"
```

## Troubleshooting

### Check Logs
```bash
# While running encore run, check terminal output
# Or in another terminal:
tail -f /tmp/encore.log  # If running in background
```

### Check if Encore is Running
```bash
ps aux | grep "encore run"
curl http://localhost:4000/health  # Should return something
```

### Verify Database Migrations
```bash
encore db migrations list
```

### Test Classification Only
```bash
curl -X POST http://localhost:4000/classify \
  -H "Content-Type: application/json" \
  -d '{"content": "What is my P&L?"}'
```

## Test Coverage

Current E2E tests cover:
- ✅ Finance question classification
- ✅ General question classification  
- ✅ Message routing
- ✅ Response streaming
- ✅ Fast classification (<100ms)
- ✅ UUID validation
- ✅ Empty message rejection
- ✅ Message length limits
- ✅ Multiple concurrent requests

See `tests/e2e/finance-chat.test.ts` for full test suite.

