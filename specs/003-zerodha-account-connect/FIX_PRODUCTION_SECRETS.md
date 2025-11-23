# Fix Production Secrets

## ❌ Issue Detected

Production deployment is using **wrong API key**:
- Got: `aqrmy3zs8uhdv8wv` (local dev key)
- Expected: `3uekqch3h9ai13r6` (Manjha-Staging key)

## ✅ Solution

Go to Encore Console and update **Production** type secrets:

### 1. Open Secrets
https://app.encore.cloud/manjha-chat-wh42/settings/secrets

### 2. Update Each Secret for Production Type

**ZerodhaApiKey** (Production):
```
3uekqch3h9ai13r6
```

**ZerodhaApiSecret** (Production):
```
n4adps77ah5i0bui5i017cgc66sg80zp
```

**ZerodhaRedirectUrl** (Production):
```
https://staging-manjha-chat-wh42.encr.app/zerodha/oauth/callback
```

**FrontendUrl** (Production):
```
https://manjha.app
```
(This one should already be correct)

### 3. Verify

After updating, test again:
```bash
curl -X POST https://staging-manjha-chat-wh42.encr.app/zerodha/oauth/initiate \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","redirectUrl":"https://manjha.app/dashboard"}'
```

Should return:
```json
{
  "oauthUrl": "https://kite.zerodha.com/connect/login?api_key=3uekqch3h9ai13r6&v=3",
  "state": "..."
}
```

### 4. Set Zerodha Console Redirect

Once secrets are correct, go to:
https://developers.kite.trade/

Set redirect URL for **Manjha-Staging** app:
```
https://staging-manjha-chat-wh42.encr.app/zerodha/oauth/callback
```

## Then You're Live! 🚀

