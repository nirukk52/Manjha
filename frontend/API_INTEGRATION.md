# Frontend-Backend Integration Guide

## Overview

This document explains how the Manjha frontend connects to the Encore.ts backend for real-time chat streaming.

## Architecture

```
User Input → API Client → Backend (Encore.ts on port 4000)
                ↓
          SSE Stream ← Backend streams response
                ↓
        React Hook (useChatStream)
                ↓
          UI Updates (DirectAnswer component)
```

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# Optional: API timeout (milliseconds)
NEXT_PUBLIC_API_TIMEOUT=30000

# Optional: Enable debug logging
NEXT_PUBLIC_DEBUG=true
```

### Production Deployment

For production, set `NEXT_PUBLIC_API_URL` to your deployed Encore backend URL:

```bash
# Example production configuration
NEXT_PUBLIC_API_URL=https://staging-manjha-abc123.encr.app
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_DEBUG=false
```

## Key Components

### 1. API Client (`lib/api-client.ts`)

Production-ready HTTP client for backend communication:

- **Automatic timeout handling**: 30s default, configurable
- **Detailed error messages**: Network errors, timeouts, HTTP errors
- **Health check support**: `checkBackendHealth()` function
- **Environment-based configuration**: All settings from `.env`

**Usage:**

```typescript
import { sendChatMessage, generateSessionId } from '@/lib/api-client';

const sessionId = generateSessionId();
const response = await sendChatMessage({
  sessionId,
  content: 'Why is my P&L negative?',
  userId: 'user-123',
});
```

### 2. Streaming Hook (`hooks/use-chat-stream.ts`)

React hook for consuming Server-Sent Events (SSE):

- **Automatic retry**: Configurable retry logic (default: 3 attempts)
- **Connection management**: Auto-cleanup on unmount
- **Error handling**: Detailed error states with retry capability
- **Debug logging**: Controlled via `NEXT_PUBLIC_DEBUG`

**Usage:**

```typescript
import { useChatStream } from '@/hooks/use-chat-stream';

const { content, state, error, startStream } = useChatStream({
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
});

// After sending message
startStream(response.streamUrl);

// Display streaming content
<p>{content}</p>
```

### 3. Chat Input Component (`components/chat-input.tsx`)

Main chat interface with backend integration:

- Sends messages via `sendChatMessage()`
- Starts SSE stream with `startStream()`
- Displays errors with retry buttons
- Shows connection status

### 4. Direct Answer Component (`components/direct-answer.tsx`)

Streaming text display:

- Auto-scrolls as content arrives
- Shows typing cursor during streaming
- Formats paragraphs and highlights key insights

## API Flow

### 1. Send Message

```typescript
POST /chat/send
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Why is my P&L negative this month?",
  "userId": "anonymous"
}

Response:
{
  "messageId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "PENDING",
  "agentType": "FINANCE",
  "streamUrl": "/chat/stream/550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000?agentType=FINANCE&query=..."
}
```

### 2. Stream Response (SSE)

```typescript
GET /chat/stream/:sessionId/:messageId?agentType=FINANCE&query=...

SSE Events:
data: {"type":"DELTA","content":"Your P&L is negative because"}
data: {"type":"DELTA","content":" you had losses in tech sector"}
data: {"type":"COMPLETE"}
```

## Error Handling

### Network Errors

When backend is unreachable:

```typescript
Error: Cannot connect to backend at http://localhost:4000. 
Please ensure the backend is running.
```

**Solution**: Start the Encore backend (`encore run` in `/backend`)

### Timeout Errors

When request exceeds timeout:

```typescript
Error: Request timed out after 30000ms. 
Please check your connection and try again.
```

**Solution**: Increase `NEXT_PUBLIC_API_TIMEOUT` or check network

### Stream Errors

When SSE connection fails:

- **Auto-retry**: Hook automatically retries up to 3 times
- **Manual retry**: UI shows "Try Again" button
- **Debug info**: Check browser console with `NEXT_PUBLIC_DEBUG=true`

## Testing

### 1. Verify Backend is Running

```bash
cd backend
encore run
```

Backend should start on `http://localhost:4000`

### 2. Test API Connection

```bash
# Health check
curl http://localhost:4000

# Send test message
curl -X POST http://localhost:4000/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Hello",
    "userId": "test"
  }'
```

### 3. Test Frontend

```bash
cd frontend
npm run dev
```

1. Open `http://localhost:3000`
2. Type a message and click Send
3. Check console for debug logs (if `DEBUG=true`)
4. Verify streaming response appears

## Troubleshooting

### Backend Not Responding

**Symptoms**: "Cannot connect to backend" error

**Check**:
1. Is backend running? (`encore run` in `/backend`)
2. Is `NEXT_PUBLIC_API_URL` correct in `.env.local`?
3. Any firewall blocking port 4000?

### Streaming Not Working

**Symptoms**: Message sent but no response streams

**Check**:
1. Browser DevTools → Network → Check SSE connection
2. Look for errors in browser console
3. Enable debug mode: `NEXT_PUBLIC_DEBUG=true`
4. Check backend logs: `encore logs`

### CORS Errors

**Symptoms**: "CORS policy" errors in console

**Solution**: Encore.ts handles CORS automatically. Ensure:
- Backend is running on correct port
- Frontend URL is allowed in `encore.app` config

## Production Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Set `NEXT_PUBLIC_DEBUG=false`
- [ ] Test with production backend
- [ ] Verify error handling works
- [ ] Test retry logic
- [ ] Check performance under load
- [ ] Enable error monitoring (Sentry, etc.)

## Performance

- **First message response**: < 3s (finance agent)
- **General message response**: < 2s
- **Streaming latency**: < 100ms per chunk
- **Auto-retry delay**: 1s between attempts

## Security

- **No sensitive data in URLs**: Session IDs are UUIDs
- **Environment variables**: Never commit `.env.local`
- **HTTPS in production**: Always use HTTPS for API URL
- **User authentication**: Stubbed as "anonymous" in MVP

## Next Steps

- [ ] Add user authentication
- [ ] Implement session persistence
- [ ] Add rate limiting UI
- [ ] Show agent type indicator
- [ ] Add conversation history
- [ ] Enable websocket for bidirectional communication

