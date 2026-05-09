# 🔐 Password Reset Feature - Quick Start Guide

## 🎯 For Developers

### Testing the Feature Locally

#### 1. Setup Environment Variables
```bash
# In .env (or .env.local for frontend)
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# Leave empty for test emails (Ethereal Mail)
```

#### 2. Test API Endpoints

**Request password reset:**
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Reset with token:**
```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"token-from-email","password":"newpassword123"}'
```

#### 3. User Flow (Manual Testing)

1. Go to `http://localhost:3000/login`
2. Click "Forgot password?"
3. Enter your email
4. Check email (or Ethereal preview URL if using test account)
5. Click reset link
6. Enter new password
7. Success! Redirect to login
8. Login with new password

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Email credentials configured in `.env`
- [ ] `FRONTEND_URL` set to actual domain
- [ ] HTTPS enforced in production
- [ ] Email sender appears legitimate
- [ ] Reset token expiry is 1 hour
- [ ] Tokens are hashed in database
- [ ] Rate limiting added (optional)
- [ ] Email verification required before login
- [ ] Password hashing uses bcryptjs

---

## 📱 Frontend Routes

| Route | Purpose |
|-------|---------|
| `/forgot-password` | Request password reset |
| `/reset-password?token=xxx` | Reset password page |
| `/login` | Has "Forgot password?" link |

---

## 🗄️ Database Schema

**User fields involved:**
```javascript
{
  email: "user@example.com",
  password: "hashed-password",
  resetPasswordToken: "hashed-token-or-null",
  resetPasswordExpires: Date // expires_at or null
}
```

**Token lifecycle:**
- Created: `forgotPassword()` - hashed before storage
- Validated: `resetPassword()` - hashed again for comparison
- Cleared: After successful reset

---

## ⚙️ Configuration Options

### Adjust Token Expiry (in authController.js)
```javascript
const RESET_PASSWORD_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // Change from 1 hour to desired value
```

### Adjust Password Requirements (in validation.js)
```javascript
const validatePassword = (password) => {
  return password && password.length >= 6; // Change min length here
};
```

### Adjust Email Template (in emailService.js)
```javascript
export const sendResetPasswordEmail = async (to, token) => {
  const url = `...`; // Customize link format
  // Customize HTML template below
};
```

---

## 🐛 Troubleshooting

### "Email not receiving"
- Check spam folder
- Verify `FRONTEND_URL` is correct in email link
- Check `EMAIL_USER` and `EMAIL_PASS` are correct
- Gmail? Use App Password, not regular password

### "Token always invalid"
- Token expires after 1 hour - request new link
- Token is single-use - check if already used
- Verify `crypto` module is available

### "Password not updating"
- Check password meets minimum length (6 chars)
- Verify token is valid and not expired
- Check user exists in database

### "Generic error messages"
- Intentional for security (prevents enumeration)
- Check server logs for actual error
- Verify validation is passing

---

## 📊 Monitoring

### Check Reset Password Activity
```javascript
// In MongoDB:
db.users.find({ 
  resetPasswordToken: { $exists: true, $ne: null } 
})
```

### Email Delivery Logs
```bash
# Check server logs for:
# - "Sending reset email to: user@example.com"
# - "Preview URL: https://ethereal.email/..." (test mode)
```

---

## 🔄 Update Flow

If you need to modify the feature:

1. **Change token expiry** → Update `RESET_PASSWORD_TOKEN_EXPIRY_MS`
2. **Change email template** → Edit `sendResetPasswordEmail()`
3. **Change validation rules** → Update `validatePassword()`
4. **Add rate limiting** → Wrap endpoint with `rateLimit()` middleware
5. **Change UI** → Modify `forgot-password` or `reset-password` page

---

## 🎓 How It Works (Technical Details)

### Backend Security Flow
```
1. User requests reset
   ↓
2. Check email exists (without revealing)
   ↓
3. Generate raw token (32 random bytes)
   ↓
4. Hash token with SHA-256
   ↓
5. Store hashed token + 1h expiry in DB
   ↓
6. Send raw token in email (can't reverse from DB)
   ↓
[User clicks link]
   ↓
7. User sends raw token from email
   ↓
8. Hash incoming token again
   ↓
9. Compare with DB hash (must match)
   ↓
10. If match + not expired: allow password change
```

### Frontend Security Flow
```
1. User navigates to /reset-password?token=xyz
   ↓
2. Frontend extracts token from URL
   ↓
3. User enters new password
   ↓
4. Submit: POST /reset-password { token, password }
   ↓
5. Backend validates and updates
   ↓
6. Frontend redirects to /login
```

---

## 💡 Best Practices

✅ Always hash tokens before storage
✅ Never log raw tokens
✅ Use 1-hour expiry (not permanent)
✅ One-time use (clear after reset)
✅ Send via secure email (HTTPS)
✅ Show generic messages (prevent enumeration)
✅ Require strong passwords
✅ Force re-login after reset

---

## 📝 API Response Codes

| Code | Scenario |
|------|----------|
| 200 | Success (email sent OR password reset) |
| 400 | Invalid email, token, or password |
| 401 | Unauthorized (MFA required) |
| 404 | User not found |
| 500 | Server error (email failed) |

---

## 🚀 Deployment Checklist

- [ ] Production email configured
- [ ] Frontend URL updated
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database indexed on email
- [ ] Backups configured
- [ ] Monitoring alerts set
- [ ] Support team trained
- [ ] User docs updated

---

Need help? Check the main implementation file: `FORGOT_PASSWORD_IMPLEMENTATION.md`
