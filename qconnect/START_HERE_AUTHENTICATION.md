# START_HERE_AUTHENTICATION.md

**Quick Start: 5-Minute Authentication Guide**

---

## 📍 Before You Begin

Already have JWT libraries installed? ✅ Yes  
Need password hashing? ✅ Yes - bcrypt is ready  
Want secure tokens? ✅ Yes - HTTP-Only cookies  

**Time to implement:** ~5 minutes (copy-paste ready examples)

---

## 🎯 What You'll Learn

1. How signup works
2. How login works
3. How to protect routes
4. How tokens refresh

---

## 1️⃣ Signup (Create Account)

### User sends:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "SecurePassword123"
  }'
```

### What happens behind the scenes:
```
1. Validate input (Zod)
2. Check email not taken
3. Hash password (bcrypt 10 rounds)
4. Save user to database
5. Return user data (no password)
```

### Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "user"
  }
}
```

---

## 2️⃣ Login (Get Tokens)

### User sends:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePassword123"
  }'
```

### What happens:
```
1. Find user by email
2. Compare password (bcrypt)
3. Create access token (JWT, 15 min)
4. Create refresh token (7 days)
5. Set HTTP-Only cookies
6. Return user data
```

### Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com"
    }
  }
}
```

**Cookies are set automatically!** No need to store them manually.

---

## 3️⃣ Use Protected Routes

### Send request with token (automatic via cookies):
```bash
curl http://localhost:3000/api/users \
  -H "Cookie: token=<your-jwt-token>"
```

### Or with Authorization header:
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <your-jwt-token>"
```

### What happens:
```
1. Extract token
2. Verify JWT signature
3. Check expiry
4. Process request
```

### Response (if valid):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "alice@example.com",
      "role": "user"
    }
  }
}
```

---

## 4️⃣ Refresh Token (After 15 minutes)

### When access token expires:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refreshToken=<your-refresh-token>"
```

### What happens:
```
1. Validate refresh token
2. Delete old refresh token (one-time use)
3. Create new access token (15 min)
4. Create new refresh token (7 days)
5. Return new cookies
```

### Response:
```json
{
  "success": true,
  "message": "Token refreshed"
}
```

**New cookies are set!** Old tokens are no longer valid.

---

## 🔐 The Flow Diagram

```
Day 1:
┌─────────────────────────────────────────────────┐
│ 1. User signs up with email & password          │
│ 2. bcrypt hashes password (10 salt rounds)      │
│ 3. Password never stored as plain text          │
└─────────────────────────────────────────────────┘

Login:
┌─────────────────────────────────────────────────┐
│ 1. User sends email & password                  │
│ 2. bcrypt.compare() checks password             │
│ 3. If valid: Generate JWT (15 min expiry)       │
│ 4. Generate Refresh Token (7 day expiry)        │
│ 5. Store tokens in HTTP-Only cookies            │
└─────────────────────────────────────────────────┘

Protected Route (0-15 min):
┌─────────────────────────────────────────────────┐
│ 1. User makes request                           │
│ 2. Cookie sent automatically                    │
│ 3. Server verifies JWT signature                │
│ 4. Process request if valid                     │
└─────────────────────────────────────────────────┘

Access Token Expires (15+ min):
┌─────────────────────────────────────────────────┐
│ 1. User's JWT expires                           │
│ 2. Protected route returns 401 Unauthorized     │
│ 3. Frontend calls /api/auth/refresh             │
│ 4. New JWT generated (15 min)                   │
│ 5. New refresh token generated                  │
│ 6. Session continues seamlessly                 │
└─────────────────────────────────────────────────┘

Refresh Token Expires (7 days):
┌─────────────────────────────────────────────────┐
│ 1. Refresh token expires                        │
│ 2. refresh endpoint returns 401                 │
│ 3. User must login again                        │
└─────────────────────────────────────────────────┘
```

---

## 🛡️ Security Highlights

### Password Storage
```
Plain:     "MyPassword123"
Hashed:    "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7Oi5aB..."

✅ One-way (can't reverse)
✅ Salted (prevents rainbow tables)
✅ bcrypt (industry standard)
```

### Token Security
```
✅ JWT signed with secret key
✅ Access token: 15 minutes (minimal theft window)
✅ Refresh token: One-time use (stolen token = single use)
✅ HTTP-Only cookies (JavaScript can't access)
✅ SameSite=Strict (CSRF protection)
```

---

## ⚙️ Configuration

### File: `.env.local`

```env
JWT_SECRET=your-super-secret-key-min-32-chars-long
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_DAYS=7
NODE_ENV=development
```

**Why 32+ chars for JWT_SECRET?**
- Minimum recommended by JWT best practices
- Provides sufficient entropy
- Resistant to brute force attacks

---

## 🧪 Quick Test (Copy & Paste)

### 1. Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123"
  }'
```

### 2. Login (copy token from response)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }' \
  -c cookies.txt
```

### 3. Use Token (use cookies.txt from login)
```bash
curl http://localhost:3000/api/users \
  -b cookies.txt
```

---

## 📋 Implementation Checklist

- [x] bcrypt installed
- [x] jsonwebtoken installed
- [x] Prisma User model set up
- [x] Signup endpoint (`/api/auth/signup`)
- [x] Login endpoint (`/api/auth/login`)
- [x] Refresh endpoint (`/api/auth/refresh`)
- [x] Logout endpoint (optional)
- [x] Protected route middleware
- [x] JWT_SECRET in .env
- [x] Error handling
- [x] Input validation (Zod)
- [x] Password hashing (bcrypt)
- [x] Token generation (JWT)

**All✅!** Ready to use.

---

## ❓ Common Questions

**Q: How long until token expires?**
A: 15 minutes for access token. If it expires, the refresh token gets a new one.

**Q: What if I close my browser?**
A: HTTP-Only cookies persist (7 days). You stay logged in.

**Q: Can JavaScript steal the token?**
A: No! HTTP-Only cookies are invisible to JavaScript (XSS protection).

**Q: What's the difference between access & refresh tokens?**
A: Access tokens are short-lived (used for every request). Refresh tokens are long-lived (only used to get new access tokens).

**Q: Why refresh tokens instead of just long-lived JWT?**
A: Because if a long-lived JWT is stolen, it's valid for days. With refresh tokens, a stolen access token is only valid 15 minutes.

**Q: Can I manually store token in localStorage?**
A: You could, but HTTP-Only cookies are more secure (immune to XSS attacks).

---

## 🚀 Next Steps

1. **Read Full Guide:** [AUTHENTICATION_IMPLEMENTATION.md](AUTHENTICATION_IMPLEMENTATION.md)
2. **Quick Reference:** [AUTHENTICATION_QUICK_REFERENCE.md](AUTHENTICATION_QUICK_REFERENCE.md)
3. **Review Code:** Check `app/api/auth/` directory
4. **Test Endpoints:** Use curl commands above
5. **Monitor Logs:** Watch console for auth events
6. **Deploy:** Follow production checklist

---

## 📞 Support

**Documentation:** [AUTHENTICATION_IMPLEMENTATION.md](AUTHENTICATION_IMPLEMENTATION.md)  
**Quick Ref:** [AUTHENTICATION_QUICK_REFERENCE.md](AUTHENTICATION_QUICK_REFERENCE.md)  
**Code:** `app/api/auth/` directory  
**Schemas:** `src/lib/schemas/authSchema.ts`  
**Utils:** `src/lib/authTokens.ts`

---

**You're all set!** 🎉 Authentication is configured and ready to use.
