# 🚀 Manual Backend Deployment Guide

## Issue: Complex Git Submodule Setup

Your project has backend as a git submodule, which requires special handling.

---

## 📋 Prerequisites (CHECK THESE FIRST)

### 1. Set Production Secret
```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha/backend
encore secret set --type prod OpenAIApiKey
```

When prompted, paste your OpenAI API key.

To verify:
```bash
encore secret list
```

You should see ✓ for Production column.

---

## 🎯 Deployment Option 1: Via Encore Dashboard (EASIEST)

This bypasses git complications entirely.

### Step 1: Commit CORS Changes Locally
```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha/backend
# The encore.app file has been updated with CORS config
# Just verify it looks correct:
cat encore.app
```

Should show:
```json
{
  "id": "manjha-9y82",
  "lang": "typescript",
  "global_cors": {
    "allow_origins_without_credentials": [
      "http://localhost:3000",
      "https://manjha.vercel.app",
      "https://manjha-*.vercel.app"
    ]
  }
}
```

### Step 2: Create Deployment Archive
```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha/backend
tar -czf ../manjha-backend-deploy.tar.gz --exclude='node_modules' --exclude='.encore' --exclude='tsconfig.tsbuildinfo' .
```

### Step 3: Deploy via Dashboard
1. Go to: https://app.encore.dev/manjha-9y82
2. Click "Settings" → "Deploy from Archive"
3. Upload `manjha-backend-deploy.tar.gz`
4. Select environment: "production" or "staging"
5. Click "Deploy"

**Deployment time**: 2-5 minutes

---

## 🎯 Deployment Option 2: Fix Git and Push (ADVANCED)

If you want to use `git push encore` workflow:

### Step 1: Initialize Backend Submodule Properly
```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha
git submodule update --init --recursive
```

### Step 2: Commit in Backend Submodule
```bash
cd backend
git checkout 001-finance-chat-agent  # or main
git add encore.app
git commit -m "feat: add CORS configuration for Vercel frontend"
```

### Step 3: Push to Encore
```bash
git push encore 001-finance-chat-agent:main
```

---

## 🎯 Deployment Option 3: Direct Deploy from CLI (SIMPLEST)

Encore CLI can deploy directly without git:

```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha/backend
encore app deploy --env=production
```

Or for staging:
```bash
encore app deploy --env=staging
```

**Note**: This might prompt you to create an environment if it doesn't exist.

---

## ✅ After Deployment: Get Your Live URL

### Check Dashboard
Go to: https://app.encore.dev/manjha-9y82

Look for:
- **Deployments** tab → Latest deployment → "API Base URL"
- It will be something like:
  - `https://staging-manjha-9y82.encr.app` (staging)
  - `https://manjha-9y82.encr.app` (production)

### Test Your Live Backend
```bash
# Replace <YOUR-URL> with actual backend URL
curl -X POST <YOUR-URL>/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "What is risk management?",
    "userId": "test"
  }'
```

Expected response:
```json
{
  "messageId": "<some-uuid>",
  "status": "PENDING",
  "agentType": "FINANCE",
  "streamUrl": "/chat/stream/..."
}
```

### View Logs
```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha/backend
encore logs --env=production
```

Or in dashboard: https://app.encore.dev/manjha-9y82/logs

---

## 🔍 Verify Everything Works

### 1. Check Database Migrations
In dashboard → Databases → "chat" → Migrations

Should see:
- ✅ 001_create_chat_sessions
- ✅ 002_create_chat_messages  
- ✅ 003_create_agent_metrics

### 2. Check Services Are Running
In dashboard → Services

Should see all 5 services:
- ✅ chat-gateway
- ✅ message-classifier
- ✅ finance-agent
- ✅ general-agent
- ✅ agent-orchestrator (if LangGraph is deployed)

### 3. Test SSE Streaming
```bash
# 1. Send message and copy streamUrl from response
curl -X POST <YOUR-URL>/chat/send \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","content":"test","userId":"test"}'

# 2. Use the streamUrl to test SSE
curl -N <YOUR-URL><STREAM-URL-FROM-ABOVE>
```

You should see streaming chunks like:
```
data: {"type":"DELTA","content":"Hello"}
data: {"type":"DELTA","content":" there"}
data: {"type":"COMPLETE"}
```

---

## 🆘 Troubleshooting

### "OpenAI API key not found"
```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha/backend
encore secret set --type prod OpenAIApiKey
# Paste your key when prompted
```

### "Migration failed"
Check logs:
```bash
encore logs --env=production | grep migration
```

Or in dashboard: Databases → chat → View logs

### "Service not responding"
Check service health in dashboard:
- Services → Select service → Logs
- Look for startup errors

### "CORS Error" (after frontend deployed)
Verify `backend/encore.app` has correct origins:
```json
{
  "global_cors": {
    "allow_origins_without_credentials": [
      "https://your-actual-vercel-url.vercel.app"
    ]
  }
}
```

Then redeploy.

---

## 💰 Cost & Usage Monitoring

### Encore Cloud (Free Tier)
- ✅ Dashboard: https://app.encore.dev/manjha-9y82/usage
- Monitor:
  - API calls
  - Database queries
  - Compute time

### OpenAI API (NOT FREE)
- ⚠️ Monitor at: https://platform.openai.com/usage
- Set budget alerts!
- Finance agent uses GPT-4 (expensive)
- General agent uses GPT-3.5 (cheaper)

---

## 📝 Save Your Backend URL

Once deployed, save your backend URL for frontend configuration:

```bash
# Your backend URL (get from dashboard)
BACKEND_URL=https://manjha-9y82.encr.app

# Save it for frontend .env.production
echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > ../frontend/.env.production
```

---

## ✅ Next Step: Deploy Frontend

Once backend is live and tested:
1. Note your backend URL
2. Follow frontend deployment guide
3. Configure frontend to point to this backend
4. Test end-to-end

---

## 🔗 Quick Links

- **Encore Dashboard**: https://app.encore.dev/manjha-9y82
- **Encore Docs**: https://encore.dev/docs
- **OpenAI Usage**: https://platform.openai.com/usage
- **Support**: https://encore.dev/discord

---

## 📞 Need Help?

If deployment fails:
1. Check logs in dashboard
2. Verify secrets are set
3. Check GitHub Issues in Encore repo
4. Ask in Encore Discord: https://encore.dev/discord

