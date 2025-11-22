# Manjha Deployment Guide

## Backend Deployment (Encore Cloud - Free Tier)

### Prerequisites Checklist
- ✅ Encore CLI installed
- ✅ Logged in as: niranjankurambhatti@gmail.com
- ✅ App ID: manjha-9y82
- ⚠️ OpenAI API Key for production (needs to be set)

### Step-by-Step Backend Deployment

#### 1. Set Production Secret
```bash
cd backend
encore secret set --type prod OpenAIApiKey
# When prompted, paste your OpenAI API key
```

#### 2. Add Encore Git Remote
Encore Cloud uses a special git remote for deployment:
```bash
# From project root
git remote add encore https://encore.dev/git/manjha-9y82.git
```

#### 3. Commit Current Changes
```bash
git add -A
git commit -m "chore: prepare backend for production deployment"
```

#### 4. Deploy to Encore Cloud
```bash
# Push to Encore's main branch triggers deployment
git push encore 001-finance-chat-agent:main
```

This will:
- Build your TypeScript backend
- Provision PostgreSQL database automatically
- Run migrations
- Deploy all services (chat-gateway, message-classifier, finance-agent, etc.)
- Generate API endpoints

#### 5. Get Your Live Backend URL
After deployment completes:
```bash
# The deployment will output your live URL, something like:
# https://staging-manjha-9y82.encr.app
# or
# https://manjha-9y82.encr.app (production)
```

You can also view it in the Encore Cloud dashboard:
```bash
# This opens your app dashboard in browser
encore app open
```

Or go directly to: https://app.encore.dev/manjha-9y82

#### 6. Verify Deployment
Test your live backend:
```bash
# Replace with your actual deployed URL
curl -X POST https://manjha-9y82.encr.app/chat/send \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"550e8400-e29b-41d4-a716-446655440000","content":"What is risk management?","userId":"test"}'
```

---

## Frontend Deployment (Next.js → Vercel)

### Prerequisites
- Backend deployed and live URL obtained
- Vercel account (free tier available)

### Step 1: Update Frontend Environment Variables

Create `.env.production` in `frontend/`:
```bash
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://manjha-9y82.encr.app
NEXT_PUBLIC_API_TIMEOUT=30000
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

#### Option B: Via GitHub Integration (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Environment Variables**: Add `NEXT_PUBLIC_API_URL` with your backend URL

### Step 3: Test End-to-End
1. Open your Vercel URL (e.g., `https://manjha.vercel.app`)
2. Try sending a chat message
3. Verify SSE streaming works

---

## CORS Configuration (IMPORTANT)

If you get CORS errors, update `backend/encore.app`:

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

Then redeploy:
```bash
git add backend/encore.app
git commit -m "fix: add CORS configuration for frontend"
git push encore 001-finance-chat-agent:main
```

---

## Monitoring & Logs

### Backend Logs (Encore)
```bash
cd backend
encore logs --env=production
```

Or view in dashboard:
https://app.encore.dev/manjha-9y82

### Frontend Logs (Vercel)
Go to: https://vercel.com/dashboard → Your Project → Logs

---

## Cost Breakdown (Free Tier Limits)

### Encore Cloud Free Tier
- ✅ Cloud environments with metrics & tracing
- ✅ Unlimited team members
- ✅ PostgreSQL database included
- ✅ Generous usage limits for prototypes
- ⚠️ Check usage at: https://app.encore.dev/manjha-9y82/usage

### Vercel Free Tier
- ✅ 100 GB bandwidth/month
- ✅ 100 GB-hours serverless function execution
- ✅ Unlimited deployments
- ⚠️ Check usage at: https://vercel.com/dashboard/usage

### OpenAI API Costs
- ⚠️ Not free - monitor at: https://platform.openai.com/usage
- Finance agent uses GPT-4 (more expensive)
- General agent uses GPT-3.5 (cheaper)

---

## Rollback & Troubleshooting

### Rollback Backend
```bash
# View deployments
encore app open

# In dashboard, click "Deployments" → select previous deployment → "Rollback"
```

### Rollback Frontend
```bash
cd frontend
vercel rollback
```

### Common Issues

**"OpenAI API Error" in production**
→ Verify secret is set: `encore secret list`
→ Re-set if needed: `encore secret set --type prod OpenAIApiKey`

**"CORS Error" in browser console**
→ Add your Vercel URL to `encore.app` CORS config (see above)

**"Database connection failed"**
→ Check Encore dashboard for database status
→ Verify migrations ran: Check logs in Encore dashboard

**Frontend shows "Cannot connect to backend"**
→ Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables
→ Test backend endpoint directly with curl

---

## Next Steps After Deployment

1. ✅ Set up monitoring alerts in Encore dashboard
2. ✅ Configure Vercel analytics
3. ✅ Set OpenAI API rate limits/budget alerts
4. ✅ Add custom domain (optional, requires paid plan on Vercel)
5. ✅ Set up CI/CD for automated deployments on git push

---

## Support Resources

- Encore Docs: https://encore.dev/docs
- Encore Discord: https://encore.dev/discord
- Vercel Docs: https://vercel.com/docs

