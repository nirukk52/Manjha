# Frontend-Backend Integration Testing Guide

## Quick Start Guide

### Prerequisites

1. **Node.js** (v18+) installed
2. **Encore CLI** installed (`brew install encoredev/tap/encore`)
3. **OpenAI API Key** configured in backend

### Step 1: Start the Backend

```bash
cd backend

# Ensure OpenAI API key is set
encore secret set --type local OpenAIApiKey

# Start Encore.ts backend (port 4000)
encore run
```

**Expected Output:**
```
API Base URL:     http://localhost:4000
Dashboard URL:    http://localhost:9400

Services:
  ✓ chat-gateway      (API)
  ✓ message-classifier (API)
  ✓ finance-agent     (API)
  ✓ general-agent     (API)
```

### Step 2: Configure Frontend Environment

```bash
cd frontend

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_DEBUG=true
EOF
```

### Step 3: Start the Frontend

```bash
# Install dependencies (first time only)
npm install

# Start Next.js dev server (port 3000)
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

### Step 4: Test the Integration

1. **Open Browser**: Navigate to `http://localhost:3000`

2. **Send a Test Message**:
   - Type: "Why is my P&L negative this month?"
   - Click Send button
   - Observe: Message appears immediately (< 100ms)

3. **Verify Streaming**:
   - Watch response stream in real-time
   - Should see typing cursor animation
   - Response should complete in < 3s

4. **Check Debug Logs** (Browser Console):
   ```
   [API Client] Sending message: {sessionId: "...", contentLength: 35}
   [API Client] Message sent successfully: {messageId: "...", agentType: "FINANCE", ...}
   [Chat Stream] Connecting to: http://localhost:4000/chat/stream/...
   [Chat Stream] Connection opened
   [Chat Stream] Received chunk: DELTA 156
   [Chat Stream] Stream completed successfully
   ```

5. **Test Error Handling**:
   - Stop backend (`Ctrl+C` in backend terminal)
   - Try sending another message
   - Should see error: "Cannot connect to backend"
   - Restart backend, click "Try Again" button

## Manual API Testing

### Test 1: Send Message Endpoint

```bash
# Generate a session ID
SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Send message
curl -X POST http://localhost:4000/chat/send \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"content\": \"What is portfolio diversification?\",
    \"userId\": \"test-user\"
  }"
```

**Expected Response:**
```json
{
  "messageId": "abc-123-...",
  "status": "PENDING",
  "agentType": "FINANCE",
  "streamUrl": "/chat/stream/..."
}
```

### Test 2: Stream Endpoint

```bash
# Use streamUrl from previous response
curl -N http://localhost:4000/chat/stream/$SESSION_ID/$MESSAGE_ID?agentType=FINANCE&query=What%20is%20portfolio%20diversification%3F
```

**Expected Output** (SSE format):
```
data: {"type":"DELTA","content":"Portfolio diversification is"}
data: {"type":"DELTA","content":" a risk management strategy"}
data: {"type":"COMPLETE"}
```

## Automated Testing Script

```bash
#!/bin/bash
# test-integration.sh

echo "🧪 Testing Frontend-Backend Integration"
echo ""

# Check backend health
echo "1. Checking backend health..."
if curl -s http://localhost:4000 > /dev/null 2>&1; then
  echo "✅ Backend is running on port 4000"
else
  echo "❌ Backend is not responding. Run 'encore run' in backend/"
  exit 1
fi

# Check frontend
echo "2. Checking frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ Frontend is running on port 3000"
else
  echo "❌ Frontend is not responding. Run 'npm run dev' in frontend/"
  exit 1
fi

# Test API endpoint
echo "3. Testing /chat/send endpoint..."
SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
RESPONSE=$(curl -s -X POST http://localhost:4000/chat/send \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"content\": \"Hello\",
    \"userId\": \"test\"
  }")

if echo "$RESPONSE" | grep -q "messageId"; then
  echo "✅ API endpoint responding correctly"
  echo "   Response: $RESPONSE"
else
  echo "❌ API endpoint error"
  echo "   Response: $RESPONSE"
  exit 1
fi

echo ""
echo "✨ All checks passed! Integration is working."
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Type a message and click Send"
echo "3. Watch it stream in real-time!"
```

**Run the script:**
```bash
chmod +x test-integration.sh
./test-integration.sh
```

## Common Issues & Solutions

### Issue 1: "Cannot connect to backend"

**Symptoms**: Frontend shows connection error

**Solutions**:
1. Check backend is running: `curl http://localhost:4000`
2. Verify `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check firewall isn't blocking port 4000

### Issue 2: "Request timed out"

**Symptoms**: Message sends but times out before response

**Solutions**:
1. Check OpenAI API key is set: `encore secret list`
2. Increase timeout in `.env.local`: `NEXT_PUBLIC_API_TIMEOUT=60000`
3. Check backend logs: `encore logs`

### Issue 3: Streaming not working

**Symptoms**: Response appears all at once, not streaming

**Solutions**:
1. Check browser DevTools → Network → Look for EventSource connection
2. Verify `Content-Type: text/event-stream` in response headers
3. Enable debug mode and check console logs

### Issue 4: CORS errors

**Symptoms**: "CORS policy" errors in browser console

**Solutions**:
- Encore handles CORS automatically
- Ensure backend `encore.app` allows localhost:3000
- Try adding to `encore.app`:
```typescript
{
  "id": "manjha",
  "cors": {
    "allow_origins_with_credentials": ["http://localhost:3000"]
  }
}
```

## Performance Benchmarks

**Expected Performance** (from spec.md):

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Classification | < 500ms | Backend logs |
| Finance agent first token | < 3s | Browser console |
| General agent response | < 2s | Browser console |
| UI message display | < 100ms | Browser DevTools Performance |
| Streaming smoothness | 60fps | Visual inspection |

## Production Deployment

### Backend (Encore Cloud)

```bash
cd backend

# Deploy to staging
encore deploy --env staging

# Get deployment URL
# Example: https://staging-manjha-abc123.encr.app
```

### Frontend (Vercel/Netlify)

```bash
cd frontend

# Set production environment variable
# NEXT_PUBLIC_API_URL=https://staging-manjha-abc123.encr.app

# Build
npm run build

# Test production build locally
npm run start
```

## Next Steps

After confirming integration works:

1. ✅ Run E2E tests: `cd backend && encore test`
2. ✅ Test with various message types (finance vs general)
3. ✅ Test error scenarios (network failure, timeout)
4. ✅ Load test with multiple concurrent sessions
5. ✅ Deploy to staging environment

## Support

If you encounter issues:

1. Check backend logs: `encore logs`
2. Check browser console (with `DEBUG=true`)
3. Review `frontend/API_INTEGRATION.md`
4. Check backend tests: `cd backend && encore test`

