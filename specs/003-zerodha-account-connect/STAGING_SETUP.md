# Zerodha Integration - Staging Setup Guide

**Status**: ✅ Backend Code Complete  
**Next**: Deploy to staging and set secrets  

---

## 📋 What Was Done

### 1. ✅ Updated Backend Code
- Added `FrontendUrl` secret support in `kite-client.ts`
- Updated OAuth callback to redirect to frontend using `getFrontendUrl()`
- Enhanced error handling for missing secrets
- Updated secrets documentation

### 2. ✅ Set Local Development Secrets
```bash
# Already configured:
ZerodhaApiKey: aqrmy3zs8uhdv8wv (dev API key)
ZerodhaApiSecret: g9j7j0q11tigt6gbghbytvg9vw8ujkt7
ZerodhaRedirectUrl: http://127.0.0.1:4000/zerodha/oauth/callback
FrontendUrl: http://127.0.0.1:3001
EncryptionKey: (already set)
```

### 3. ✅ Created Staging API Keys
**Zerodha App**: Manjha-Staging  
**API Key**: `3uekqch3h9ai13r6`  
**API Secret**: `n4adps77ah5i0bui5i017cgc66sg80zp`  

---

## 🚀 Deployment Steps

### Step 1: Update Staging Secrets in Encore Console

You mentioned you already updated the staging secrets in the Encore console. Verify these are set for the **staging** environment:

| Secret Name | Staging Value |
|-------------|--------------|
| `ZerodhaApiKey` | `3uekqch3h9ai13r6` |
| `ZerodhaApiSecret` | `n4adps77ah5i0bui5i017cgc66sg80zp` |
| `ZerodhaRedirectUrl` | `https://staging-manjha-chat-wh42.encr.app/zerodha/oauth/callback` |
| `FrontendUrl` | ⚠️ **TO BE SET** (after Vercel deployment) |
| `EncryptionKey` | ✅ (already set) |
| `OpenAIApiKey2` | ✅ (already set) |

**To verify secrets in Encore Console**:
1. Go to https://app.encore.cloud/manjha-chat-wh42
2. Navigate to Settings → Secrets
3. Ensure staging environment has all values

---

### Step 2: Configure Zerodha Developer Console

**URL**: https://developers.kite.trade/

**For Staging App (Manjha-Staging)**:
- ✅ API Key: `3uekqch3h9ai13r6`
- ✅ API Secret: `n4adps77ah5i0bui5i017cgc66sg80zp`
- ⚠️ **Redirect URL**: Set to `https://staging-manjha-chat-wh42.encr.app/zerodha/oauth/callback`

**Important**: Make sure you use the **exact URL** with no trailing slash.

---

### Step 3: Deploy Backend to Encore Cloud

```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha

# Ensure all changes are committed
git add backend/
git commit -m "feat: add Zerodha OAuth integration with staging support"

# Push to Encore (deploys to staging environment)
git push encore main:main
```

**Expected Output**:
```
remote: main: triggered deploy https://app.encore.cloud/manjha-chat-wh42/deploys/staging/...
```

**Backend will be live at**:
```
https://staging-manjha-chat-wh42.encr.app
```

---

### Step 4: Test Backend Deployment

```bash
# Test health endpoint
curl https://staging-manjha-chat-wh42.encr.app/hello/World

# Expected: {"message":"Hello World!"}

# Test Zerodha OAuth initiation
curl -X POST https://staging-manjha-chat-wh42.encr.app/zerodha/oauth/initiate \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","redirectUrl":"https://your-frontend.vercel.app/dashboard"}'

# Expected: {"oauthUrl":"https://kite.zerodha.com/connect/login?api_key=3uekqch3h9ai13r6&v=3","state":"..."}
```

---

### Step 5: Deploy Frontend to Vercel

```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha/frontend

# Set backend API URL as environment variable
echo "https://staging-manjha-chat-wh42.encr.app" | \
  vercel env add NEXT_PUBLIC_API_URL production

# Deploy to Vercel
vercel --prod
```

**Your frontend will be deployed at something like**:
```
https://your-project.vercel.app
```

**Note the URL** - you'll need it for Step 6.

---

### Step 6: Set FrontendUrl Secret

After Vercel deployment completes, set the `FrontendUrl` secret:

**Option A: Via Encore Console** (Recommended)
1. Go to https://app.encore.cloud/manjha-chat-wh42/settings/secrets
2. Find `FrontendUrl` secret
3. Set value for **staging** environment to your Vercel URL
   - Example: `https://your-project.vercel.app`

**Option B: Via CLI**
```bash
cd backend
encore secret set --env staging FrontendUrl
# When prompted, enter: https://your-project.vercel.app
```

---

### Step 7: Update CORS in encore.app

Ensure your Vercel frontend URL is in the CORS allowlist:

**File**: `backend/encore.app`
```json
{
  "id": "manjha-chat-wh42",
  "lang": "typescript",
  "global_cors": {
    "allow_origins_without_credentials": [
      "http://localhost:3000",
      "http://127.0.0.1:3001",
      "https://your-project.vercel.app",
      "https://your-project-*.vercel.app"
    ]
  }
}
```

If you need to update it:
```bash
# Edit backend/encore.app
# Then redeploy
git add backend/encore.app
git commit -m "chore: update CORS for Vercel frontend"
git push encore main:main
```

---

## ✅ End-to-End Testing

### 1. Test OAuth Flow

1. Open your frontend: `https://your-project.vercel.app/dashboard`
2. Click "Connect Zerodha Account" button (when implemented)
3. Should redirect to Zerodha login
4. After login, should come back to your dashboard with `?connected=true`

### 2. Test Balance Fetching

```bash
# Check connection status
curl "https://staging-manjha-chat-wh42.encr.app/zerodha/connection/status?userId=your-user-id"

# Refresh balance
curl -X POST https://staging-manjha-chat-wh42.encr.app/zerodha/balance/refresh \
  -H "Content-Type: application/json" \
  -d '{"userId":"your-user-id","force":true}'
```

---

## 🔍 Troubleshooting

### Issue: "Failed to read FrontendUrl secret"

**Cause**: Secret not set for staging environment

**Fix**: Follow Step 6 to set the FrontendUrl secret

---

### Issue: CORS errors in browser

**Cause**: Vercel URL not in CORS allowlist

**Fix**: Follow Step 7 to update CORS configuration

---

### Issue: OAuth callback fails with 500 error

**Check**:
1. Zerodha redirect URL matches backend URL exactly
2. All staging secrets are set correctly
3. Check Encore logs: `encore logs --env=staging`

---

### Issue: "Invalid OAuth state" error

**Possible causes**:
1. State expired (> 15 minutes old)
2. State already used
3. Database connection issue

**Fix**: Try initiating OAuth flow again

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────┐
│  Zerodha Developer Console          │
│  App: Manjha-Staging                │
│  Redirect: https://staging-...      │
│    .../zerodha/oauth/callback       │
└─────────────────────────────────────┘
                 ↓ OAuth callback
┌─────────────────────────────────────┐
│  Encore Cloud (Staging)             │
│  https://staging-manjha-chat-wh42   │
│    .encr.app                        │
│                                     │
│  Endpoints:                         │
│  - POST /zerodha/oauth/initiate     │
│  - GET /zerodha/oauth/callback      │
│  - GET /zerodha/connection/status   │
│  - POST /zerodha/balance/refresh    │
│  - POST /zerodha/connection/        │
│         disconnect                  │
└─────────────────────────────────────┘
                 ↓ Redirects to
┌─────────────────────────────────────┐
│  Vercel (Frontend)                  │
│  https://your-project.vercel.app    │
│                                     │
│  Pages:                             │
│  - /dashboard (with OAuth callback) │
└─────────────────────────────────────┘
```

---

## 🎯 Success Checklist

Before marking deployment complete:

- [ ] All staging secrets set in Encore Console
- [ ] Zerodha redirect URL configured for staging
- [ ] Backend deployed to Encore Cloud
- [ ] Frontend deployed to Vercel
- [ ] FrontendUrl secret updated with Vercel URL
- [ ] CORS configured with Vercel domain
- [ ] OAuth initiation endpoint returns 200 OK
- [ ] Complete OAuth flow works end-to-end
- [ ] Balance can be fetched after connection
- [ ] Connection status endpoint works

---

## 📝 Next Steps After Deployment

1. **Implement Frontend UI** (Phase 5)
   - Connect button in dashboard
   - Balance display widget
   - Session expiry warnings

2. **Add Session Expiry Monitoring** (Phase 5)
   - Cron job for expiry detection
   - User notifications

3. **E2E Tests** (Phase 6)
   - Automated OAuth flow testing
   - Balance fetching tests

4. **Production Deployment**
   - Create production API keys
   - Deploy to Encore production environment
   - Update Vercel production deployment

---

## 🔐 Security Notes

- ✅ Tokens encrypted at rest (AES-256-GCM)
- ✅ API secrets in Encore secret management
- ✅ CSRF protection via OAuth state parameter
- ✅ HTTPS enforced for production
- ✅ Separate API keys for dev/staging

---

## 📚 Related Documentation

- Encore Deployment: https://encore.dev/docs/deploy/deploying
- Vercel CLI: https://vercel.com/docs/cli
- Kite Connect OAuth: https://kite.trade/docs/connect/v3/user/
- Skill: `.claude/skills/encore-vercel-deploy/SKILL.md`

---

**Last Updated**: 2025-11-23  
**Backend Status**: ✅ Ready for Deployment  
**Frontend Status**: ⏳ Pending Implementation

