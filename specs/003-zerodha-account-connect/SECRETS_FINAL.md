# Zerodha Secrets - Final Configuration

## ✅ Completed

### Local (dev)
- `ZerodhaApiKey`: `aqrmy3zs8uhdv8wv` ✅
- `ZerodhaApiSecret`: `g9j7j0q11tigt6gbghbytvg9vw8ujkt7` ✅
- `ZerodhaRedirectUrl`: `http://127.0.0.1:4000/zerodha/oauth/callback` ✅
- `FrontendUrl`: `http://127.0.0.1:3001` ✅

### Staging (production)
- `ZerodhaApiKey`: `3uekqch3h9ai13r6` ✅ (Updated in Console)
- `ZerodhaApiSecret`: `n4adps77ah5i0bui5i017cgc66sg80zp` ✅ (Updated in Console)
- `ZerodhaRedirectUrl`: `https://staging-manjha-chat-wh42.encr.app/zerodha/oauth/callback` ✅ (Updated in Console)
- `FrontendUrl`: `https://manjha.app` ✅

### Both
- `EncryptionKey`: (64-char hex) ✅

---

## CORS Updated
`backend/encore.app` now includes:
- `https://manjha.app` ✅
- `https://manjha-*.vercel.app` ✅
- `http://127.0.0.1:3001` ✅

---

## Ready to Deploy! 🚀

```bash
git add backend/
git commit -m "feat: add Zerodha integration + staging config"
git push encore main:main
```

