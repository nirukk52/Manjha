# 004: Progressive Authentication

## Goal
Let users send 1 free message, then require Google sign-in on 2nd message.

---

## User Flow

```

User types Message 2
        │
        ▼
Frontend sends to /chat/send
        │
        ▼
Backend: "Anonymous + count >= 1? Return AUTH_REQUIRED"
        │
        ▼
Frontend receives AUTH_REQUIRED
        │
        ├── Stores message text in local state
        │
        └── Shows Google sign-in popup
                │
                ▼
        User signs in successfully
                │
                ▼
        Frontend: Re-sends stored message (now with auth token)
                │
                ▼
        Backend: Processes normally → streams response
```

---

## Backend Changes

### 1. Gateway: Count + Gate
**File**: `chat-gateway/gateway.ts`

- Before processing, count user's messages for session
- If `count >= 1 && userId === 'anonymous'` → return `AUTH_REQUIRED`

### 2. New Response Type
**File**: `contracts/api.types.ts`

```typescript
export interface AuthRequiredResponse {
  type: 'AUTH_REQUIRED';
  reason: 'SECOND_MESSAGE';
  provider: 'google';
}
```

### 3. Encore Auth Handler
**File**: `chat-gateway/auth.ts` (new)

- Validate BetterAuth session token from header
- Return `userId` if valid

---

## Frontend Changes

### 1. BetterAuth Setup
**File**: `lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();
```

### 2. API Route
**File**: `app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth.handler);
```

### 3. Auth Instance
**File**: `lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

### 4. Handle AUTH_REQUIRED
**File**: `components/chat-panel.tsx`

- On `AUTH_REQUIRED` response → show sign-in modal
- Call `authClient.signIn.social({ provider: "google" })`
- After success → retry message

---

## Secrets Required

| Secret | Where |
|--------|-------|
| `GOOGLE_CLIENT_ID` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console |
| `BETTER_AUTH_SECRET` | Random 32+ char string |

**Redirect URI**: `http://localhost:3000/api/auth/callback/google` (dev)

---

## Tasks

1. [ ] Add `AUTH_REQUIRED` response type to contracts
2. [ ] Add message count check in gateway
3. [ ] Set up BetterAuth in frontend (`lib/auth.ts`, API route)
4. [ ] Create Google OAuth credentials
5. [ ] Add auth modal component
6. [ ] Wire up chat-panel to handle `AUTH_REQUIRED`
7. [ ] Add Encore auth handler to validate tokens
8. [ ] E2E test: anonymous → 2nd message → sign-in → continue


