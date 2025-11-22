# Deployment Checklist

Use this checklist for every deployment to ensure smooth releases.

## Pre-Deployment

### Backend Verification

- [ ] `encore run` runs without errors locally
- [ ] All services start successfully
- [ ] Database migrations are sequential and tested
- [ ] Environment variables documented
- [ ] API endpoints tested via Local Development Dashboard

### Frontend Verification

- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] Linter passes or ESLint disabled in production config
- [ ] API client points to correct backend URL

### Git Structure

- [ ] Backend is NOT a git submodule: `git ls-tree HEAD backend` shows files, not `160000`
- [ ] All changes committed: `git status` is clean
- [ ] On correct branch (usually `main`)
- [ ] No merge conflicts

### Secrets & Configuration

- [ ] All required secrets documented
- [ ] OpenAI API key available
- [ ] `encore.app` CORS config includes production domains
- [ ] Frontend environment variables list prepared

---

## Backend Deployment

### Encore Setup

- [ ] Encore CLI installed: `encore version`
- [ ] Authenticated: `encore auth whoami`
- [ ] App created or linked
- [ ] `backend/encore.app` has correct app ID

### Git Remote

- [ ] Encore remote configured: `git remote -v` shows `encore://app-id`
- [ ] Remote URL uses `encore://` protocol (not `https://`)

### Secrets

- [ ] OpenAI key set: `encore secret set --type prod,dev OpenAIApiKey`
- [ ] All other required secrets set
- [ ] Verify: `encore secret list`

### Deploy

- [ ] Changes committed to git
- [ ] Push to Encore: `git push encore main:main`
- [ ] Deployment triggered (check output for URL)
- [ ] Monitor deployment in dashboard

### Verification

- [ ] Health endpoint responds: `curl https://staging-app-id.encr.app/hello/World`
- [ ] All expected services visible in Encore dashboard
- [ ] No error logs in first 5 minutes
- [ ] Database migrations applied successfully

---

## Frontend Deployment

### Vercel Setup

- [ ] Vercel CLI installed: `vercel --version`
- [ ] Authenticated: `vercel whoami`
- [ ] Project linked or will be created

### Environment Variables

- [ ] `NEXT_PUBLIC_API_URL` set to backend staging URL
- [ ] Other env vars configured (if any)
- [ ] Variables set for all environments (Production, Preview, Development)

### Deploy

- [ ] Deploy to Vercel: `vercel --prod --yes`
- [ ] Or push to GitHub (if GitHub integration enabled)
- [ ] Wait for build to complete

### Verification

- [ ] Frontend accessible: Visit production URL
- [ ] No console errors in browser DevTools
- [ ] API calls reaching backend (check Network tab)
- [ ] Basic user flow works (send message, receive response)

---

## Post-Deployment

### Integration Testing

- [ ] End-to-end flow works:
  - [ ] User can send message
  - [ ] Message classified correctly
  - [ ] Agent responds via streaming
  - [ ] Response displayed in UI
- [ ] CORS working (no browser errors)
- [ ] Authentication working (if applicable)

### Monitoring

- [ ] Backend logs clean: `encore logs --env=staging`
- [ ] No error spike in Encore dashboard
- [ ] Frontend analytics normal (if configured)
- [ ] Response times acceptable

### Documentation

- [ ] Deployment notes documented
- [ ] Any configuration changes noted
- [ ] Known issues logged
- [ ] Team notified of deployment

---

## Rollback Plan

### If Backend Fails

```bash
# Option 1: Revert commit
git revert <bad-commit>
git push encore main:main

# Option 2: Force push previous good commit
git reset --hard <good-commit>
git push encore main:main --force  # ⚠️ Use with caution
```

### If Frontend Fails

```bash
cd frontend
vercel rollback
```

### Emergency Contacts

- Encore Status: https://status.encore.dev
- Vercel Status: https://www.vercel-status.com
- Team Slack/Discord: [Your channel]

---

## Common Failure Points & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Secret not defined | `encore secret set --type prod,dev SecretName` |
| CORS error | Update `backend/encore.app`, redeploy |
| 404 on endpoint | Check service deployed, verify path |
| Env var not applied | Redeploy frontend after setting |
| Build timeout | Increase timeout in Vercel settings |
| Database migration fail | Check migration files sequential |

---

## Success Criteria

Deployment is successful when:

✅ Backend health check returns 200 OK
✅ All services visible in Encore dashboard  
✅ Frontend loads without errors  
✅ API calls succeed from frontend to backend  
✅ Streaming endpoints work  
✅ No critical errors in logs  
✅ User flows complete successfully  

---

## Next Deployment

Before next deployment, review:

- Any tech debt introduced
- Performance metrics vs baseline
- User feedback from this release
- Failed deployment attempts and lessons learned

Keep this checklist updated as deployment process evolves.

