# RESTful API Routes Documentation

## Overview

This document outlines the **QConnect** API route hierarchy, structure, and design principles following RESTful conventions. All API endpoints are file-based, using Next.js App Router in the `app/api/` directory.

---

## API Route Hierarchy

The following is the complete structure of organized API routes:

```
app/api/
├── users/
│   ├── route.ts           # GET all users (paginated, searchable)
│   │                      # POST create new user
│   └── [id]/
│       └── route.ts       # GET user by ID
│                          # PATCH update user
│                          # DELETE user
├── appointments/
│   ├── route.ts           # GET all appointments (paginated, filterable)
│   │                      # POST create new appointment
│   └── [id]/
│       └── route.ts       # GET appointment by ID
│                          # PATCH update appointment
│                          # DELETE appointment
├── doctors/
│   ├── route.ts           # GET all doctors (paginated, searchable)
│   │                      # POST create new doctor
│   └── [id]/
│       └── route.ts       # GET doctor by ID
│                          # PATCH update doctor
│                          # DELETE doctor
├── auth/
│   ├── login/
│   │   └── route.ts       # POST user login
│   ├── signup/
│   │   └── route.ts       # POST user registration
│   └── me/
│       └── route.ts       # GET current user profile
├── email/
│   └── route.ts           # POST send email notifications
├── queues/
│   └── route.ts           # API for queue management
├── files/
│   └── route.ts           # File handling operations
├── upload/
│   └── route.ts           # File upload to storage (S3/Azure)
├── security/
│   └── route.ts           # Security-related operations
└── admin/
    └── route.ts           # Admin-only operations
```

---

## API Design Principles

### 1. **Naming Conventions**
- ✅ Use **plural nouns** for resources: `/api/users`, not `/api/getUsers`
- ✅ Use **lowercase** consistently
- ✅ Use **hyphens** for multi-word resources (if needed): `/api/user-profiles`
- ✅ Avoid special characters and spaces
- ❌ Never use verbs in routes: `/api/createUser`, `/api/deleteDoctor`

### 2. **HTTP Methods**

| HTTP Verb | Purpose | Example Route | Status Code |
|-----------|---------|---------------|-------------|
| **GET** | Read data (all or filtered) | `GET /api/users` | 200 |
| **GET** | Read specific record | `GET /api/users/123` | 200 |
| **POST** | Create new resource | `POST /api/users` | 201 |
| **PATCH** | Partial update | `PATCH /api/users/123` | 200 |
| **DELETE** | Remove resource | `DELETE /api/users/123` | 200 or 204 |

### 3. **Pagination & Filtering**
All list endpoints support pagination with query parameters:

```
GET /api/users?page=1&limit=10
GET /api/appointments?page=2&limit=20&status=pending&queueId=5
GET /api/doctors?q=John&page=1&limit=15
```

- `page` (default: 1) — Which page to retrieve
- `limit` (default: 10, max: 100) — Results per page
- `q` (optional) — Search query (name, email, etc.)
- Resource-specific filters (e.g., `status`, `queueId`)

### 4. **Error Handling & Status Codes**

| Code | Meaning | When to Use |
|------|---------|------------|
| **200** | OK | Successful GET, PATCH, or DELETE |
| **201** | Created | Successful POST (resource created) |
| **400** | Bad Request | Invalid input, validation errors |
| **401** | Unauthorized | Missing/invalid authentication |
| **403** | Forbidden | Authenticated but no permission (RBAC) |
| **404** | Not Found | Resource doesn't exist |
| **500** | Internal Server Error | Unexpected server error |

### 5. **Response Format**

All endpoints return JSON with a consistent structure:

**Success Response:**
```json
{
  "success": true,
  "data": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "data": [...]
  },
  "message": "Users fetched successfully",
  "code": "SUCCESS"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Not found",
  "code": "NOT_FOUND",
  "statusCode": 404,
  "details": "User with ID 999 does not exist"
}
```

---

## Detailed Route Documentation

### Users API

#### GET `/api/users` - Fetch All Users (Paginated)

**Authentication:** Required (header: `x-user-email`)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10, max: 100)
- `q` (optional) — Search by name or email

**Response (200 OK):**
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
        "role": "user",
        "createdAt": "2025-12-17T10:30:00Z"
      }
    ],
    "meta": {
      "accessedBy": "admin@example.com",
      "role": "admin"
    }
  },
  "message": "Users fetched successfully"
}
```

**Caching:** Results are cached for 60 seconds by default via Redis.

---

#### POST `/api/users` - Create New User

**Authentication:** Optional

**Request Body:**
```json
{
  "name": "Charlie Brown",
  "email": "charlie@example.com",
  "phone": "+0987654321",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 43,
    "name": "Charlie Brown",
    "email": "charlie@example.com",
    "phone": "+0987654321",
    "role": "user",
    "createdAt": "2026-01-17T14:22:00Z"
  },
  "message": "User created successfully"
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation Error",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

#### GET `/api/users/[id]` - Get Specific User

**Authentication:** Optional

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1234567890",
    "role": "admin",
    "createdAt": "2025-12-17T10:30:00Z"
  },
  "message": "User fetched successfully"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "error": "Not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

---

#### PATCH `/api/users/[id]` - Update User

**Authentication:** Required (RBAC: Admin or self)

**Request Body:**
```json
{
  "name": "Alice J.",
  "phone": "+1111111111"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice J.",
    "email": "alice@example.com",
    "phone": "+1111111111",
    "role": "admin",
    "createdAt": "2025-12-17T10:30:00Z"
  },
  "message": "User updated successfully"
}
```

---

#### DELETE `/api/users/[id]` - Delete User

**Authentication:** Required (RBAC: Admin only or user deleting themselves)

**Response (200 OK):**
```json
{
  "success": true,
  "data": null,
  "message": "User deleted successfully"
}
```

**Error (403 Forbidden):**
```json
{
  "success": false,
  "error": "Access denied",
  "code": "UNAUTHORIZED",
  "statusCode": 403
}
```

---

### Appointments API

#### GET `/api/appointments` - Fetch All Appointments

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `queueId` (optional) — Filter by queue
- `userId` (optional) — Filter by user
- `status` (optional) — Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "data": [
      {
        "id": 1,
        "tokenNo": 5,
        "status": "PENDING",
        "userId": 10,
        "queueId": 2,
        "createdAt": "2026-01-15T09:00:00Z"
      }
    ]
  },
  "message": "Appointments fetched"
}
```

---

#### POST `/api/appointments` - Create New Appointment

**Request Body:**
```json
{
  "userId": 10,
  "queueId": 2
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 157,
    "tokenNo": 42,
    "status": "PENDING",
    "userId": 10,
    "queueId": 2,
    "createdAt": "2026-01-17T14:30:00Z"
  },
  "message": "Appointment created"
}
```

**Behavior:** Uses database transaction to ensure atomicity:
1. Retrieves current queue number
2. Creates appointment with incremented token number
3. Updates queue counter (idempotent & concurrent-safe)

---

#### GET `/api/appointments/[id]` - Get Specific Appointment

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tokenNo": 5,
    "status": "CONFIRMED",
    "userId": 10,
    "queueId": 2,
    "createdAt": "2026-01-15T09:00:00Z"
  },
  "message": "Appointment fetched successfully"
}
```

---

#### PATCH `/api/appointments/[id]` - Update Appointment

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tokenNo": 5,
    "status": "COMPLETED",
    "userId": 10,
    "queueId": 2,
    "createdAt": "2026-01-15T09:00:00Z"
  },
  "message": "Appointment updated successfully"
}
```

---

### Doctors API

#### GET `/api/doctors` - Fetch All Doctors

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `q` (optional) — Search by name

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "data": [
      {
        "id": 1,
        "name": "Dr. Sarah Ahmed",
        "specialization": "Cardiology",
        "email": "sarah.ahmed@hospital.com",
        "phone": "+1234567890",
        "createdAt": "2025-12-20T12:00:00Z"
      }
    ]
  },
  "message": "Doctors fetched"
}
```

---

#### POST `/api/doctors` - Create New Doctor

**Request Body:**
```json
{
  "name": "Dr. Michael Brown",
  "specialization": "Neurology",
  "email": "michael.brown@hospital.com",
  "phone": "+9876543210"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 9,
    "name": "Dr. Michael Brown",
    "specialization": "Neurology",
    "email": "michael.brown@hospital.com",
    "phone": "+9876543210",
    "createdAt": "2026-01-17T14:30:00Z"
  },
  "message": "Doctor created"
}
```

---

#### GET `/api/doctors/[id]` - Get Specific Doctor

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dr. Sarah Ahmed",
    "specialization": "Cardiology",
    "email": "sarah.ahmed@hospital.com",
    "phone": "+1234567890",
    "createdAt": "2025-12-20T12:00:00Z"
  },
  "message": "Doctor fetched successfully"
}
```

---

#### PATCH `/api/doctors/[id]` - Update Doctor

**Request Body:**
```json
{
  "specialization": "Cardiology & Internal Medicine"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dr. Sarah Ahmed",
    "specialization": "Cardiology & Internal Medicine",
    "email": "sarah.ahmed@hospital.com",
    "phone": "+1234567890",
    "createdAt": "2025-12-20T12:00:00Z"
  },
  "message": "Doctor updated successfully"
}
```

---

### Authentication API

#### POST `/api/auth/signup` - User Registration

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 100,
    "name": "New User",
    "email": "newuser@example.com",
    "token": "eyJhbGc..."
  },
  "message": "User registered successfully"
}
```

---

#### POST `/api/auth/login` - User Login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "Login successful"
}
```

---

#### GET `/api/auth/me` - Get Current User

**Authentication:** Required (header: `Authorization: Bearer <token>`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "admin"
  },
  "message": "Current user fetched"
}
```

---

## Consistency & Maintainability Reflection

### Why Consistent Naming Matters

1. **Predictability** — Developers can guess endpoints without documentation. If they know `/api/users`, they'll predict `/api/doctors`, `/api/appointments`, etc.

2. **Reduced Errors** — Consistent naming prevents integration mistakes:
   - ✅ `/api/users?page=1` (predictable)
   - ❌ `/api/getUsers?pageNumber=1` (non-standard)

3. **Maintainability** — When new developers join, they don't need to learn 10 different patterns:
   - All list endpoints: `GET /api/{resource}?page=...&limit=...&q=...`
   - All detail endpoints: `GET /api/{resource}/[id]`
   - All create endpoints: `POST /api/{resource}`
   - All update endpoints: `PATCH /api/{resource}/[id]`

4. **Scalability** — Adding new resources (e.g., `/api/queues`, `/api/schedules`) follows the same pattern without confusion.

5. **API Documentation** — Consistent structure makes auto-generated documentation reliable and useful.

### Error Handling Design

- **Consistent Error Structure** — Every error follows the same JSON shape with `success`, `error`, `code`, `statusCode`, and `details` fields.
- **Meaningful Status Codes** — Using correct HTTP status codes allows clients to handle errors programmatically.
- **Validation Errors** — Field-level error information helps clients provide precise user feedback.
- **Authorization Errors** — Clear distinction between 401 (auth missing) and 403 (permission denied).

### Best Practices Implemented

✅ **Resource-Based Naming** — No verbs in routes  
✅ **Plural Forms** — `/api/users`, not `/api/user`  
✅ **Pagination Built-In** — All list endpoints support `page` and `limit`  
✅ **Search/Filter Support** — Query strings for dynamic filtering  
✅ **RBAC Integration** — Authentication headers and permission checks  
✅ **Atomic Transactions** — Appointments use DB transactions for consistency  
✅ **Caching Strategy** — Redis caching for list endpoints to improve performance  
✅ **Error Codes** — Custom error codes for easier client-side error handling  
✅ **Standard Response Format** — Consistent JSON structure across all endpoints  

---

## Testing Your Routes

### Using curl

**Test GET all users:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=5" \
  -H "x-user-email: admin@example.com" \
  -H "x-user-role: admin"
```

**Test GET user by ID:**
```bash
curl -X GET "http://localhost:3000/api/users/1"
```

**Test POST create user:**
```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "SecurePass123!"
  }'
```

**Test PATCH update user:**
```bash
curl -X PATCH "http://localhost:3000/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice J.",
    "phone": "+1111111111"
  }'
```

**Test DELETE user:**
```bash
curl -X DELETE "http://localhost:3000/api/users/1" \
  -H "x-user-id: 1" \
  -H "x-user-role: admin"
```

### Using Postman

1. **Import Collection** — Use `docs/postman_collection.json`
2. **Set Environment Variables:**
   - `baseURL`: `http://localhost:3000`
   - `token`: Your JWT token from `/api/auth/login`
3. **Test Endpoints** — Run requests and validate responses
4. **Document Results** — Export test results as evidence

---

## Additional Resources

- [Next.js API Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [RESTful API Design Guidelines (MDN)](https://developer.mozilla.org/en-US/docs/Glossary/REST)
- [HTTP Methods (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [HTTP Status Codes (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [QConnect Architecture](ARCHITECTURE.md)

---

**Last Updated:** January 17, 2026  
**Maintainer:** QConnect Development Team
