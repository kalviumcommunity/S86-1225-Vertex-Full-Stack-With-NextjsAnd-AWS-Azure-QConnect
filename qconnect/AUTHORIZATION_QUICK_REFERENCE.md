# AUTHORIZATION_QUICK_REFERENCE.md

**Quick Reference: Role-Based Access Control (RBAC)**

---

## ⚡ 5-Minute Quick Start

### What You Need to Know

**Authorization = Role-Based Access Control**

Users have roles:
- `admin` - Full system access
- `doctor` - Limited to doctor features
- `user` - Patient/basic features

Middleware checks role before allowing access.

---

## 📍 Protected Routes

| Route | Method | Requires | Access |
|-------|--------|----------|--------|
| `/api/admin` | GET | admin | Admin dashboard |
| `/api/users` | GET | any auth | List users |
| `/api/users/[id]` | DELETE | admin | Delete user |
| `/api/doctors` | GET | any auth | View doctors |
| `/api/doctors` | POST | admin | Create doctor |
| `/api/appointments` | GET | any auth | View appointments |
| `/api/appointments` | POST | any auth | Book appointment |
| `/api/appointments` | DELETE | admin | Delete appointment |

---

## 🧪 Quick Test Examples

### Admin Access (Works)
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_JWT>"

# Response: 200 OK + admin dashboard
```

### User Access Admin Route (Denied)
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <USER_JWT>"

# Response: 403 Forbidden
```

### No Token (Denied)
```bash
curl -X GET http://localhost:3000/api/admin

# Response: 401 Unauthorized
```

### Any User Access Shared Route (Works)
```bash
curl -X GET http://localhost:3000/api/doctors \
  -H "Authorization: Bearer <ANY_JWT>"

# Response: 200 OK + list of doctors
```

---

## 📊 HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Authorization passed, operation succeeded |
| 400 | Bad Request | Validation error (not permission-related) |
| 401 | Unauthorized | Missing/invalid token or expired |
| 403 | Forbidden | Valid token, but insufficient role |
| 500 | Server Error | Internal error |

---

## 🔒 Security Checklist

- [x] Middleware validates JWT on protected routes
- [x] Role checks performed at middleware level
- [x] User context attached to request headers
- [x] Principle of least privilege applied
- [x] Multiple verification layers
- [x] Consistent error messages
- [x] CORS headers configured
- [x] Security headers added
- [x] Token extracted from header or cookie
- [x] Expired tokens rejected

---

## 🛠️ Troubleshooting

**Issue: 401 Unauthorized**
- Token missing: Add Authorization header
- Token expired: Call `/api/auth/refresh`
- Invalid signature: Check JWT_SECRET

**Issue: 403 Forbidden**
- Wrong role: User doesn't have required role
- Solution: Login as admin or ask admin to grant role

**Issue: 405 Method Not Allowed**
- Endpoint exists but method not implemented
- Check route file for GET/POST/PUT/DELETE

---

## 🔑 Key Files

- `app/middleware.ts` - Authorization middleware
- `app/api/admin/route.ts` - Admin routes
- `app/api/users/route.ts` - User routes
- `app/api/doctors/route.ts` - Doctor routes
- `app/api/appointments/route.ts` - Appointment routes

---

## ✅ Implementation Checklist

- [x] Middleware created
- [x] Protected routes defined
- [x] Admin routes implemented
- [x] User routes enhanced
- [x] Doctor routes secured
- [x] Appointment routes secured
- [x] Error handling complete
- [x] Tests documented
- [x] Documentation complete

---

**Authorization Implementation Complete!** ✅
