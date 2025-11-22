# Deployment Troubleshooting Reference

## Backend Issues (Encore)

### Problem: Git Push Rejected - "repository not found"

**Symptoms:**
```
fatal: repository 'https://encore.dev/git/app-id.git/' not found
```

**Root Cause:**
- Wrong git remote URL format
- App not created in Encore Cloud
- Authentication expired

**Solution:**
```bash
# 1. Verify authentication
encore auth whoami

# 2. Verify app exists
# Visit https://app.encore.cloud and check app list

# 3. Fix git remote (use encore:// protocol, not https://)
git remote remove encore
git remote add encore encore://your-app-id

# 4. Try push again
git push encore main:main
```

---

### Problem: Deployment Fails - "secret key(s) not defined"

**Symptoms:**
```
ERR Infrastructure change failed error="failed to check secrets: secret key(s) not defined: OpenAIApiKey"
```

**Root Cause:**
Services require secrets that haven't been set in Encore

**Solution:**
```bash
cd backend

# Set secret for all environments
encore secret set --type prod,dev OpenAIApiKey

# Or set for specific environment
encore secret set --type prod OpenAIApiKey

# Verify
encore secret list

# Trigger redeploy
git commit --allow-empty -m "chore: redeploy after secrets"
git push encore main:main
```

---

### Problem: Backend Shows Wrong Services

**Symptoms:**
- Dashboard shows old services (e.g., "auth", "portfolio")
- Expected services (e.g., "chat-gateway", "agent-orchestrator") missing
- Endpoints return 404

**Root Cause:**
Backend directory was a broken git submodule - files never pushed

**Diagnosis:**
```bash
# Check what's tracked in git
git ls-files backend | head -20

# If output is just "backend" or empty → Problem confirmed
```

**Solution:**
```bash
# 1. Remove broken submodule reference
git rm --cached backend

# 2. Add backend files properly
git add backend

# 3. Commit
git commit -m "fix: properly add backend to git"

# 4. Push to GitHub
git push origin main

# 5. Push to Encore
git push encore main:main
```

---

### Problem: Database Migration Failures

**Symptoms:**
```
ERR Migration failed: relation "table_name" already exists
```

**Solution:**
```bash
# Reset local database
cd backend
encore db reset

# For production, check migration files
cd chat-gateway/migrations/
ls -la *.up.sql

# Ensure sequential numbering: 001_, 002_, 003_, etc.
```

---

### Problem: Service Won't Start - Import Errors

**Symptoms:**
```
ERR Cannot find module '~encore/clients'
```

**Solution:**
```bash
cd backend

# Regenerate Encore types
encore run  # Let it fail, but it generates types

# Or manually trigger generation
encore gen client

# Verify encore.gen/ folder exists
ls -la encore.gen/
```

---

## Frontend Issues (Vercel)

### Problem: Build Fails - ESLint Errors

**Symptoms:**
```
Failed to compile.
./components/file.tsx
Warning: Invalid Tailwind CSS classnames order
```

**Solution:**

Update `next.config.mjs`:
```javascript
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Add this
  },
}
```

Then redeploy.

---

### Problem: Environment Variable Not Applied

**Symptoms:**
- Frontend still points to localhost
- `NEXT_PUBLIC_API_URL` undefined in browser

**Root Cause:**
- Variable set but deployment not triggered
- Variable misspelled
- Variable set for wrong environment

**Solution:**

**Via Dashboard:**
1. Go to: https://vercel.com/your-team/project/settings/environment-variables
2. Find `NEXT_PUBLIC_API_URL`
3. Edit value to: `https://staging-your-app-id.encr.app`
4. Check: Production, Preview, Development
5. Click "Save"
6. Redeploy from Deployments tab

**Via CLI:**
```bash
cd frontend

# Remove old value (if exists)
vercel env rm NEXT_PUBLIC_API_URL production

# Add new value
echo "https://staging-your-app-id.encr.app" | vercel env add NEXT_PUBLIC_API_URL production

# Trigger redeploy
vercel --prod --yes
```

---

### Problem: Wrong Vercel Domain

**Symptoms:**
- Got: `frontend-long-hash.vercel.app`
- Want: `myapp.vercel.app`

**Solution:**

**Option 1: Rename Project**
1. Go to: https://vercel.com/your-team/frontend/settings
2. Find "Project Name" section
3. Change to desired name (e.g., "myapp")
4. Save
5. Next deployment will be at `myapp.vercel.app`

**Option 2: Add Custom Domain**
1. Go to: https://vercel.com/your-team/project/settings/domains
2. Click "Add"
3. Enter custom domain
4. Follow DNS setup instructions

---

### Problem: 401 Unauthorized from Backend

**Symptoms:**
```
GET https://staging-app-id.encr.app/chat/send → 401
```

**Root Cause:**
- Endpoint requires auth but frontend not sending credentials
- Or endpoint should be public but marked as auth-required

**Solution:**

Check endpoint definition in backend:
```typescript
// If endpoint should be public:
export const send = api(
  { expose: true, method: "POST" },  // Add expose: true
  async (req) => { ... }
);

// If endpoint needs auth, add auth: true
export const send = api(
  { auth: true, method: "POST" },
  async (req) => { ... }
);
```

---

## Integration Issues

### Problem: CORS Errors

**Symptoms:**
```
Access to fetch at 'https://staging-app-id.encr.app/chat/send' 
from origin 'https://myapp.vercel.app' has been blocked by CORS policy
```

**Root Cause:**
Frontend domain not in backend CORS configuration

**Solution:**

Update `backend/encore.app`:
```json
{
  "id": "your-app-id",
  "lang": "typescript",
  "global_cors": {
    "allow_origins_without_credentials": [
      "http://localhost:3000",
      "https://myapp.vercel.app",           // ← Add actual domain
      "https://myapp-*.vercel.app"          // ← Add preview domains
    ]
  }
}
```

Commit and deploy:
```bash
git add backend/encore.app
git commit -m "fix: add CORS for production domain"
git push encore main:main
```

---

### Problem: SSE Streaming Not Working

**Symptoms:**
- Chat message sent successfully
- No streaming response
- EventSource errors in console

**Root Cause:**
- Network timeout
- Backend streaming endpoint error
- EventSource connection closed prematurely

**Debugging:**

1. **Test backend directly:**
```bash
curl -N https://staging-app-id.encr.app/chat/stream/session-id/msg-id?query=test
```

2. **Check backend logs:**
```bash
cd backend
encore logs --env=staging
```

3. **Verify endpoint in Encore dashboard:**
- Go to: https://app.encore.cloud/your-app-id
- Check "API Explorer" → Find `/chat/stream` endpoint
- Verify it's deployed and responsive

---

## Quick Diagnostic Commands

```bash
# Check all authentication
encore auth whoami && vercel whoami

# Check git structure
git ls-tree HEAD backend | head -5

# Check git remotes
git remote -v

# Check Encore app ID
cat backend/encore.app | grep '"id"'

# Test backend health
APP_ID=$(cat backend/encore.app | grep '"id"' | cut -d'"' -f4)
curl "https://staging-$APP_ID.encr.app/hello/World"

# Check Vercel env vars
cd frontend && vercel env ls

# View Encore secrets
cd backend && encore secret list
```

---

## Emergency Rollback

### Rollback Backend (Encore)

```bash
# View recent deployments
# Go to: https://app.encore.cloud/your-app-id/deploys

# Rollback via git (if deployment broken)
git log --oneline -10
git revert <bad-commit-hash>
git push encore main:main
```

### Rollback Frontend (Vercel)

```bash
cd frontend

# List recent deployments
vercel list

# Rollback to previous
vercel rollback
```

---

## Prevention Checklist

Before every deployment:

- [ ] Run `encore run` locally - verify no errors
- [ ] Run `cd frontend && npm run build` - verify builds
- [ ] Check `git status` - ensure backend files tracked
- [ ] Verify secrets set: `encore secret list`
- [ ] Test health endpoint after deploy
- [ ] Monitor logs for 5 minutes post-deploy

---

## Getting Help

If issues persist:

1. **Encore Discord**: https://encore.dev/discord
2. **Encore Docs**: https://encore.dev/docs
3. **Vercel Support**: https://vercel.com/support
4. **Check Status Pages**:
   - Encore: https://status.encore.dev
   - Vercel: https://www.vercel-status.com

