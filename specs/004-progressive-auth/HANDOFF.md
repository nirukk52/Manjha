# Handoff: Progressive Auth (Google Sign-in on 2nd Message)

## What We're Building
Anonymous users get 1 free message. On message 2, show Google sign-in popup. After sign-in, auto-retry the message.

---

## Implementation Order

### Step 1: Frontend - BetterAuth Setup
```bash
cd frontend && npm install better-auth
```

**Create these files:**

1. `lib/auth.ts` - BetterAuth instance with Google provider
2. `app/api/auth/[...all]/route.ts` - Auth API route  
3. `lib/auth-client.ts` - React client

**Secrets needed:**
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from Google Cloud Console
- `BETTER_AUTH_SECRET` (random 32+ chars)
- Redirect URI: `http://localhost:3000/api/auth/callback/google`

---

### Step 2: Backend - AUTH_REQUIRED Response

**File: `contracts/api.types.ts`**
- Add `AuthRequiredResponse` type with `type: 'AUTH_REQUIRED'`

**File: `chat-gateway/gateway.ts`**
- In `send()`, before classification:
  - Count messages: `SELECT COUNT(*) FROM chat_messages WHERE session_id = $1 AND sender = 'USER'`
  - If `count >= 1 && !authenticated` → return `AuthRequiredResponse`

---

### Step 3: Frontend - Handle AUTH_REQUIRED

**File: `components/chat-panel.tsx` (or wherever chat is)**

```typescript
// Pseudocode
const [pendingMessage, setPendingMessage] = useState<string | null>(null);

// When sending message:
const response = await sendMessage(content);
if (response.type === 'AUTH_REQUIRED') {
  setPendingMessage(content);
  await authClient.signIn.social({ provider: "google" }); // Opens popup
  return;
}

// After auth success (in useEffect or callback):
if (session && pendingMessage) {
  await sendMessage(pendingMessage); // Retry with auth
  setPendingMessage(null);
}
```

---

## Key Files to Modify

| File | Change |
|------|--------|
| `frontend/lib/auth.ts` | NEW - BetterAuth instance |
| `frontend/lib/auth-client.ts` | NEW - React auth client |
| `frontend/app/api/auth/[...all]/route.ts` | NEW - Auth API route |
| `backend/contracts/api.types.ts` | Add `AuthRequiredResponse` |
| `backend/chat-gateway/gateway.ts` | Add message count + gate |
| `frontend/components/chat-panel.tsx` | Handle AUTH_REQUIRED + retry |

---

## Test Scenario

1. Open app (anonymous)
2. Send "Hello" → ✅ Gets response
3. Send "What's my portfolio?" → 🔒 Google sign-in popup appears
4. Sign in with Google → Message auto-retries → ✅ Gets response
5. Send more messages → ✅ All work (authenticated)

---

## Reference Docs

- BetterAuth Google setup: See `spec.md` in this folder
- Current gateway: `backend/chat-gateway/gateway.ts`
- Current contracts: `backend/contracts/api.types.ts`

