# 🚀 Deploy Backend NOW - Quick Start

## ⚠️ FIRST: Set Production Secret (Manual Step Required)

You MUST set your OpenAI API key for production before deploying:

```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha/backend
encore secret set --type prod OpenAIApiKey
```

When prompted, paste your OpenAI API key.

---

## ✅ Already Done

1. ✅ Encore remote added: `encore https://encore.dev/git/manjha-9y82.git`
2. ✅ CORS configured for Vercel frontend URLs
3. ✅ Logged in as: niranjankurambhatti@gmail.com
4. ✅ App linked: manjha-9y82

---

## 🎯 Deploy Steps (Run These Commands)

### Step 1: Commit Changes
```bash
cd /Users/priyankalalge/Projects/Manjha/Manjha
git add -A
git commit -m "chore: configure CORS and prepare for production deployment"
```

### Step 2: Push to Encore Cloud (Deploy!)
```bash
git push encore 001-finance-chat-agent:main
```

This will:
- Build TypeScript backend
- Provision PostgreSQL database
- Run migrations (001_create_chat_sessions, 002_create_chat_messages, 003_create_agent_metrics)
- Deploy all services:
  - chat-gateway (SSE streaming)
  - agents (LangGraph-based)

**Expected deployment time**: 2-5 minutes

---

## 📍 After Deployment: Get Your Backend URL

Your backend will be live at:
```
https://staging-manjha-9y82.encr.app
# OR
https://manjha-9y82.encr.app
```

To find it:
```bash
# Open Encore dashboard in browser
cd /Users/priyankalalge/Projects/Manjha/Manjha/backend
encore app open
```

Or go directly to: **https://app.encore.dev/manjha-9y82**

---

## ✅ Test Your Live Backend

Once deployed, test it:

```bash
# Replace <YOUR-BACKEND-URL> with actual URL from dashboard
curl -X POST <YOUR-BACKEND-URL>/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "What is risk management?",
    "userId": "test"
  }'
```

You should get a response like:
```json
{
  "messageId": "uuid",
  "status": "PENDING",
  "agentType": "FINANCE",
  "streamUrl": "/chat/stream/..."
}
```

---

## 🔥 Next: Deploy Frontend

Once backend is live:

1. **Copy your backend URL** from Encore dashboard
2. **Update frontend environment**:
   ```bash
   cd /Users/priyankalalge/Projects/Manjha/Manjha/frontend
   echo "NEXT_PUBLIC_API_URL=<YOUR-BACKEND-URL>" > .env.production
   ```
3. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

---

## 🆘 Troubleshooting

**"OpenAI API key not set" error**
→ Run: `encore secret set --type prod OpenAIApiKey`

**"Permission denied" on git push**
→ Run: `encore auth login` and try again

**"Migration failed"**
→ Check logs: `encore logs --env=production`
→ View in dashboard: https://app.encore.dev/manjha-9y82/logs

**Want to see real-time deployment logs?**
→ Watch the terminal during `git push encore`
→ Or check dashboard: https://app.encore.dev/manjha-9y82/deployments

---

## 💰 Cost Check (Free Tier)

✅ Encore Cloud: FREE (generous limits for prototypes)
✅ PostgreSQL: FREE (included with Encore)
⚠️ OpenAI API: NOT FREE (monitor at https://platform.openai.com/usage)

Set OpenAI budget alerts to avoid surprises!

---

## 🎉 Summary

**Right now, you need to:**

1. Set production secret: `encore secret set --type prod OpenAIApiKey`
2. Commit: `git add -A && git commit -m "chore: prepare deployment"`
3. Deploy: `git push encore 001-finance-chat-agent:main`
4. Get backend URL from: https://app.encore.dev/manjha-9y82
5. Move to frontend deployment!

