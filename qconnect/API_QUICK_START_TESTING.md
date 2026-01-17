# Quick Start Guide - Testing QConnect API

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

### Step 2: Seed Sample Data

In a new terminal:

```bash
npm run db:seed
```

This populates the database with test users, doctors, appointments, and queues.

### Step 3: Test an Endpoint (Choose One)

#### Option A: Using curl

**Test 1 - Get all users:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=5" \
  -H "x-user-email: admin@example.com" \
  -H "x-user-role: admin"
```

**Test 2 - Create a new user:**
```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "TestPass123!"
  }'
```

**Test 3 - Get all appointments:**
```bash
curl -X GET "http://localhost:3000/api/appointments?page=1&limit=10"
```

#### Option B: Using Postman

1. Open Postman
2. Click **File** → **Import**
3. Select `docs/postman_collection_complete.json`
4. Set `base_url` variable to `http://localhost:3000`
5. Click **Send** on any request

#### Option C: Using your Browser

Visit these URLs directly:

- List all doctors: `http://localhost:3000/api/doctors`
- Get specific doctor: `http://localhost:3000/api/doctors/1`
- Get all appointments: `http://localhost:3000/api/appointments`

---

## 📚 Full Test Suites

### Comprehensive Test with curl

Run this script to test all major endpoints:

```bash
#!/bin/bash
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_ROLE="admin"

echo "=== Testing QConnect API ==="
echo ""

echo "1. GET /api/users (paginated)"
curl -s -X GET "$BASE_URL/api/users?page=1&limit=5" \
  -H "x-user-email: $ADMIN_EMAIL" \
  -H "x-user-role: $ADMIN_ROLE" | jq .

echo ""
echo "2. GET /api/doctors (paginated)"
curl -s -X GET "$BASE_URL/api/doctors?page=1&limit=10" | jq .

echo ""
echo "3. GET /api/appointments (paginated)"
curl -s -X GET "$BASE_URL/api/appointments?page=1&limit=10" | jq .

echo ""
echo "4. POST /api/users (create)"
curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+1555555555",
    "password": "SecurePass123!"
  }' | jq .

echo ""
echo "5. POST /api/appointments (atomic transaction)"
curl -s -X POST "$BASE_URL/api/appointments" \
  -H "Content-Type: application/json" \
  -d '{"userId": 10, "queueId": 2}' | jq .

echo ""
echo "=== Tests Complete ==="
```

Save as `test_api.sh`, then run:
```bash
bash test_api.sh
```

### Running Jest Tests

Run integration tests for API routes:

```bash
# Run all API tests
npm test -- __tests__/api

# Run with coverage
npm run test:coverage -- __tests__/api

# Run specific test file
npm test -- __tests__/api/users.test.ts
```

---

## 🎯 Common Test Scenarios

### Scenario 1: Create User and Login

```bash
# 1. Create a new user
curl -X POST "http://localhost:3000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'

# 2. Login with that user
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'

# 3. Copy the token from response and use it
curl -X GET "http://localhost:3000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Scenario 2: Create and Update Appointment

```bash
# 1. Create appointment
APPT_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/appointments" \
  -H "Content-Type: application/json" \
  -d '{"userId": 10, "queueId": 2}')

APPT_ID=$(echo $APPT_RESPONSE | jq -r '.data.id')

# 2. Update appointment status
curl -X PATCH "http://localhost:3000/api/appointments/$APPT_ID" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'

# 3. Retrieve updated appointment
curl -X GET "http://localhost:3000/api/appointments/$APPT_ID"
```

### Scenario 3: Search Functionality

```bash
# Search users by name
curl -X GET "http://localhost:3000/api/users?q=alice&page=1&limit=10"

# Search doctors by specialization
curl -X GET "http://localhost:3000/api/doctors?q=cardio&page=1&limit=10"
```

### Scenario 4: Pagination

```bash
# Get first page
curl -X GET "http://localhost:3000/api/users?page=1&limit=10"

# Get second page
curl -X GET "http://localhost:3000/api/users?page=2&limit=10"

# Get with custom limit
curl -X GET "http://localhost:3000/api/users?page=1&limit=50"
```

---

## 🧪 Test Everything Checklist

- [ ] **Users API**
  - [ ] GET all users (with pagination)
  - [ ] GET users with search
  - [ ] GET specific user
  - [ ] POST create user
  - [ ] PATCH update user
  - [ ] DELETE user (as admin)

- [ ] **Doctors API**
  - [ ] GET all doctors
  - [ ] GET doctors with search
  - [ ] GET specific doctor
  - [ ] POST create doctor
  - [ ] PATCH update doctor

- [ ] **Appointments API**
  - [ ] GET all appointments
  - [ ] GET appointments filtered by status
  - [ ] GET appointments filtered by user
  - [ ] GET specific appointment
  - [ ] POST create appointment (verify atomic transaction)
  - [ ] PATCH update appointment

- [ ] **Authentication API**
  - [ ] POST signup
  - [ ] POST login
  - [ ] GET current user (/auth/me)

- [ ] **Error Handling**
  - [ ] GET non-existent user (404)
  - [ ] POST invalid email (400)
  - [ ] GET without auth headers (401)
  - [ ] DELETE without permission (403)

---

## 📊 Verification Checklist

After running tests, verify:

✅ All responses have `success`, `data`, `message`, `code` fields  
✅ List endpoints return `page`, `limit`, `total` in data  
✅ Create operations return HTTP 201  
✅ Read operations return HTTP 200  
✅ Update operations return HTTP 200  
✅ Delete operations return HTTP 200  
✅ Error responses include `statusCode` and `details`  
✅ Pagination works (can fetch different pages)  
✅ Search filters work correctly  
✅ RBAC prevents unauthorized deletes (403)  

---

## 🔍 Debugging Tips

### View Response Prettified

Use `jq` to pretty-print JSON:

```bash
curl -s "http://localhost:3000/api/users?page=1" | jq .
```

### Check Response Headers

```bash
curl -i "http://localhost:3000/api/users?page=1" \
  -H "x-user-email: admin@example.com" \
  -H "x-user-role: admin"
```

### Save Response to File

```bash
curl "http://localhost:3000/api/users?page=1" > response.json
cat response.json | jq .
```

### View Server Logs

In the terminal where you ran `npm run dev`, watch for:
- Request logs (showing endpoint called)
- Cache hits/misses
- Database queries
- Errors

Example log output:
```
Cache Hit - /api/users?page=1&limit=10
Cache Miss - /api/users?page=2&limit=10
DB Query: SELECT * FROM "User" LIMIT 10
```

---

## 📝 Expected Responses

### Success - Get Users List

```json
{
  "success": true,
  "data": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "data": [
      {
        "id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "phone": "+1234567890",
        "role": "admin",
        "createdAt": "2025-12-17T10:30:00.000Z"
      }
    ]
  },
  "message": "Users fetched successfully",
  "code": "SUCCESS"
}
```

### Error - Not Found

```json
{
  "success": false,
  "error": "Not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

### Error - Validation

```json
{
  "success": false,
  "error": "Validation Error",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

---

## 🚨 Common Issues & Solutions

### Issue: "ECONNREFUSED" - Can't connect to server

**Solution:** Make sure `npm run dev` is running in another terminal

### Issue: "Unauthorized" (401) on user list

**Solution:** Add auth headers:
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "x-user-email: admin@example.com" \
  -H "x-user-role: admin"
```

### Issue: "Table 'User' does not exist"

**Solution:** Run migrations and seed:
```bash
npm run migrate:dev
npm run db:seed
```

### Issue: "Validation Error" on POST

**Solution:** Check the error details field shows which field is invalid, fix and retry

### Issue: Getting cached data when expecting fresh data

**Solution:** Cache TTL is 60 seconds. Wait or skip page number to get fresh query

---

## 📚 Full Documentation

For more details, see:

- [API_ROUTES_DOCUMENTATION.md](API_ROUTES_DOCUMENTATION.md) — Complete endpoint reference
- [API_TEST_EVIDENCE.md](API_TEST_EVIDENCE.md) — 25+ test scenarios
- [README.md](README.md) — Overview and setup guide
- [docs/postman_collection_complete.json](docs/postman_collection_complete.json) — Postman collection

---

## ✅ You're Ready!

You now have everything needed to:
- ✅ Test all API endpoints
- ✅ Verify CRUD operations
- ✅ Check error handling
- ✅ Validate response formats
- ✅ Debug any issues

**Next Steps:**
1. Run `npm run dev` to start server
2. Pick a test scenario above
3. Run the curl commands or Postman requests
4. Verify all responses match expected format

Happy testing! 🎉

