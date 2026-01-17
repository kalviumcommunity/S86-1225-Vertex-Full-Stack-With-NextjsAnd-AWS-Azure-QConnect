# QConnect API - Reference Card

## 🗺️ API Endpoints Map

### Users
```
GET    /api/users                    List all users (paginated, searchable)
POST   /api/users                    Create new user
GET    /api/users/[id]               Get specific user
PATCH  /api/users/[id]               Update user
DELETE /api/users/[id]               Delete user (admin or self)
```

### Doctors
```
GET    /api/doctors                  List all doctors (paginated, searchable)
POST   /api/doctors                  Create new doctor
GET    /api/doctors/[id]             Get specific doctor
PATCH  /api/doctors/[id]             Update doctor
DELETE /api/doctors/[id]             Delete doctor
```

### Appointments
```
GET    /api/appointments             List all appointments (paginated, filterable)
POST   /api/appointments             Create appointment (atomic transaction)
GET    /api/appointments/[id]        Get specific appointment
PATCH  /api/appointments/[id]        Update appointment
DELETE /api/appointments/[id]        Delete appointment
```

### Authentication
```
POST   /api/auth/signup              Register new user
POST   /api/auth/login               Login user
GET    /api/auth/me                  Get current user (requires JWT)
```

---

## 📊 Quick Query Reference

### Pagination
```
?page=1                 Get page 1 (default)
?limit=10               Results per page (default: 10, max: 100)
?page=2&limit=20        Get page 2 with 20 results
```

### Searching
```
?q=alice                Search by name (users, doctors)
?q=cardio               Search by text (case-insensitive)
```

### Filtering
```
?status=PENDING         Filter by status (appointments)
?userId=10              Filter by user ID (appointments)
?queueId=2              Filter by queue ID (appointments)
```

### Combined
```
?q=alice&page=1&limit=10           Search "alice" on first page
?status=CONFIRMED&page=1&limit=20  Confirmed appointments, page 1
?userId=10&status=COMPLETED        User 10's completed appointments
```

---

## 🔑 HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | GET/PATCH/DELETE success |
| 201 | Created | POST success |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | No permission (RBAC) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected error |

---

## 📝 Common curl Patterns

### List (Paginated)
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "x-user-email: admin@example.com" \
  -H "x-user-role: admin"
```

### Search
```bash
curl -X GET "http://localhost:3000/api/users?q=alice&page=1&limit=5"
```

### Get By ID
```bash
curl -X GET "http://localhost:3000/api/users/1"
```

### Create
```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","phone":"+1234567890","password":"Pass123!"}'
```

### Update
```bash
curl -X PATCH "http://localhost:3000/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe"}'
```

### Delete
```bash
curl -X DELETE "http://localhost:3000/api/users/1" \
  -H "x-user-id: 1" \
  -H "x-user-role: admin"
```

---

## 📋 Response Format

### Success
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Description",
  "code": "SUCCESS"
}
```

### Error
```json
{
  "success": false,
  "error": "Error type",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "details": "Details"
}
```

---

## 🔐 Authentication Headers

### For Protected Routes (Users List)
```
x-user-email: admin@example.com
x-user-role: admin
```

### JWT Token
```
Authorization: Bearer eyJhbGc...
```

---

## ⚡ Quick Examples

### Get All Users
```
GET /api/users?page=1&limit=10
x-user-email: admin@example.com
x-user-role: admin
```

### Create Appointment
```
POST /api/appointments
Content-Type: application/json

{
  "userId": 10,
  "queueId": 2
}
```

### Search Doctors
```
GET /api/doctors?q=cardio&page=1&limit=10
```

### Update Status
```
PATCH /api/appointments/1
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

---

## 🎯 Testing Checklist

- [ ] List endpoints return paginated data
- [ ] Search filters work correctly
- [ ] Can create new resources
- [ ] Can retrieve specific resource
- [ ] Can update resources
- [ ] Can delete resources (with auth)
- [ ] Validation errors show field details
- [ ] 404 returned for missing resources
- [ ] 403 returned for unauthorized deletes
- [ ] Response format is consistent

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| API_ROUTES_DOCUMENTATION.md | Complete reference (30-40 min) |
| API_TEST_EVIDENCE.md | Testing guide (30-40 min) |
| API_QUICK_START_TESTING.md | Quick start (5-10 min) |
| API_DOCUMENTATION_INDEX.md | Navigation guide |
| docs/postman_collection_complete.json | Postman collection |
| README.md | Project overview |

---

## 🚀 Start Testing

```bash
# 1. Start server
npm run dev

# 2. Seed data
npm run db:seed

# 3. Test an endpoint
curl -X GET "http://localhost:3000/api/doctors"

# 4. Or use Postman
# Import: docs/postman_collection_complete.json
```

---

## 💡 Pro Tips

✅ Use Postman for complex testing  
✅ Always use pagination for large datasets  
✅ Check error `code` for programmatic handling  
✅ Include search query for UX improvements  
✅ Cache TTL is 60 seconds (wait or skip page for fresh data)  
✅ Appointment creation uses transactions (atomic)  
✅ RBAC required for user deletes  
✅ All responses include consistent envelope  

---

**Print This Card** for quick reference while coding!  
**Last Updated:** January 17, 2026
