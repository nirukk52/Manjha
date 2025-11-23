# Zerodha OAuth Flow - Architecture Reference

## 🔐 OAuth Redirect URL Explanation

**IMPORTANT**: The redirect URL is **BACKEND**, not frontend!

### Why Backend Redirect?

Zerodha returns sensitive tokens (`request_token`) after authentication. These must be:
1. Exchanged for `access_token` using `api_secret` (which NEVER goes to frontend)
2. Encrypted before storage
3. Validated with CSRF state parameter

All of this happens on the **backend** for security.

---

## 📊 Complete OAuth Flow Diagram

```
┌─────────────┐
│   Frontend  │
│ localhost:  │
│    3001     │
└──────┬──────┘
       │ 1. User clicks "Connect"
       │
       ↓
┌─────────────────────────────────────────────────┐
│ POST /zerodha/oauth/initiate                    │
│ Backend generates state, returns Zerodha URL    │
└──────┬──────────────────────────────────────────┘
       │ 2. Frontend redirects user to Zerodha
       │
       ↓
┌─────────────────┐
│     Zerodha     │
│  kite.trade     │  3. User logs in & authorizes
└──────┬──────────┘
       │ 4. Zerodha redirects with request_token
       │
       ↓
┌─────────────────────────────────────────────────┐
│ GET /zerodha/oauth/callback                     │
│ ?request_token=xxx&state=yyy                    │
│                                                  │
│ Backend (localhost:4000):                       │
│ - Validates state                               │
│ - Exchanges request_token for access_token      │
│ - Encrypts & stores token                       │
│ - Fetches user profile                          │
└──────┬──────────────────────────────────────────┘
       │ 5. Backend redirects to frontend
       │
       ↓
┌─────────────┐
│  Frontend   │
│  /dashboard │  6. Shows "Connected" status
│?connected=  │
│    true     │
└─────────────┘
```

---

## 🔧 Configuration

### Zerodha Developer Console Settings

1. Go to: https://developers.kite.trade/
2. Create a Kite Connect app
3. **Redirect URL**: `http://localhost:4000/zerodha/oauth/callback`
   - ⚠️ Must match EXACTLY (including port)
   - Port 4000 = Encore backend
   - Port 3001 = Next.js frontend

### Encore Secrets (Already Set ✅)

```bash
# API credentials from Zerodha Developer Console
ZerodhaApiKey: aqrmy3zs8uhdv8wv
ZerodhaApiSecret: g9j7j0q11tigt6gbghbytvg9vw8ujkt7

# Backend OAuth callback URL (must match Zerodha settings)
ZerodhaRedirectUrl: http://localhost:4000/zerodha/oauth/callback

# 32-byte hex key for AES-256 encryption
EncryptionKey: ba58bf75f8e8349770b786d5925b4ae89c44e385502d531808b46cb46db6a50a
```

---

## 🚀 Testing the Flow

### 1. Start Backend
```bash
cd backend
encore run
```
Backend runs on: **http://localhost:4000**

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: **http://localhost:3000** or **3001**

### 3. Test OAuth Flow

1. Go to frontend: `http://localhost:3001/dashboard`
2. Click "Connect Your Account" button
3. You'll be redirected to: `https://kite.zerodha.com/connect/login?api_key=aqrmy3zs8uhdv8wv`
4. Login with Zerodha credentials
5. After auth, Zerodha redirects to: `http://localhost:4000/zerodha/oauth/callback?request_token=...&state=...`
6. Backend processes and redirects to: `http://localhost:3001/dashboard?connected=true`
7. Frontend shows connection status + balance

---

## 🔍 Debugging

### Check OAuth Callback Logs

```bash
# Backend logs will show:
[INFO] Received OAuth callback { requestToken: "...", status: "success", state: "..." }
[INFO] Exchanging request token for access token
[INFO] Session generated successfully
[INFO] User profile fetched { zerodhaUserId: "...", userName: "..." }
[INFO] Connection stored successfully
```

### Common Issues

**"Invalid OAuth state"**
- State parameter expired (15 minutes)
- State already used
- Solution: Try connecting again

**"Redirect URL mismatch"**
- Zerodha app settings don't match `ZerodhaRedirectUrl`
- Solution: Update Kite Connect app settings to `http://localhost:4000/zerodha/oauth/callback`

**"Authorization failed"**
- User cancelled on Zerodha page
- Solution: Try connecting again

---

## 📝 Production Considerations

### Production Redirect URL

For production, update:
- **Zerodha app settings**: `https://your-domain.com/zerodha/oauth/callback`
- **Encore secret**: 
  ```bash
  encore secret set --env production ZerodhaRedirectUrl
  # Enter: https://your-domain.com/zerodha/oauth/callback
  ```

### Frontend Redirect

Backend currently redirects to `/dashboard?connected=true` (relative path).

For production with custom domain:
- Update line 170 in `backend/zerodha-auth/auth.ts`:
  ```typescript
  resp.writeHead(302, {
    Location: `${process.env.FRONTEND_URL || ''}/dashboard?connected=true`,
  });
  ```

---

## 🔐 Security Notes

1. **API Secret NEVER goes to frontend** - Only backend knows it
2. **Access tokens encrypted at rest** - Using AES-256-GCM
3. **CSRF protection** - State parameter with 15-min expiry
4. **HTTPS required in production** - OAuth spec requirement
5. **Tokens expire every ~6 hours** - User must reconnect

---

## 🎯 Next Steps

1. ✅ Secrets configured
2. ⏳ Start backend with `encore run`
3. ⏳ Implement frontend "Connect" button
4. ⏳ Test complete OAuth flow
5. ⏳ Implement session expiry handling
6. ⏳ Add frontend balance display

