# Integration Testing for API Routes

**Last Updated**: January 17, 2026  
**Version**: 1.0  
**Status**: Complete

---

## Table of Contents

1. [Overview](#overview)
2. [What is Integration Testing](#what-is-integration-testing)
3. [Testing Pyramid](#testing-pyramid)
4. [Setting Up Mock Service Worker (MSW)](#setting-up-mock-service-worker-msw)
5. [Integration Test Examples](#integration-test-examples)
6. [Best Practices](#best-practices)
7. [Running Integration Tests](#running-integration-tests)
8. [Advanced Scenarios](#advanced-scenarios)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## Overview

Integration testing validates that multiple modules work together correctly. Unlike unit tests that isolate individual functions, integration tests verify:

- **API Route Interactions**: How route handlers interact with services and database
- **Request/Response Flow**: Complete request lifecycle with middleware and error handling
- **Database Operations**: Mocking Prisma for data persistence scenarios
- **External Service Integration**: Email, authentication, third-party APIs
- **Error Handling**: How errors propagate through the system

**Key Benefits**:
- ✅ Catch bugs at module boundaries
- ✅ Validate request/response contracts
- ✅ Test business logic end-to-end
- ✅ Ensure error handling works correctly
- ✅ Provide regression protection

---

## What is Integration Testing

### Unit Tests vs Integration Tests vs E2E Tests

| Aspect | Unit Tests | Integration Tests | E2E Tests |
|--------|-----------|-------------------|-----------|
| **Scope** | Single function | Multiple modules | Full user workflow |
| **Isolation** | High (mocked deps) | Medium (real interactions) | Low (real browser) |
| **Speed** | Very Fast (ms) | Medium (100-500ms) | Slow (seconds) |
| **Cost** | Low | Medium | High |
| **Coverage** | 80%+ | 70%+ | 30%+ |
| **Tools** | Jest | Jest + MSW | Cypress/Playwright |

### Integration Testing in QConnect

For an API-driven healthcare system like QConnect, integration tests verify:

```
┌─────────────────────────────────────┐
│   Client Request (HTTP)             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Middleware (Auth, Logging)        │ ← Mock or skip
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Route Handler (Business Logic)    │ ← Test this
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Database (Prisma ORM)             │ ← Mock with MSW
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   External Services (Email, Auth)   │ ← Mock with MSW
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Response (JSON)                   │ ← Verify response
└─────────────────────────────────────┘
```

---

## Testing Pyramid

```
        ╱╲
       ╱  ╲        E2E Tests (5%)
      ╱────╲       Cypress/Playwright
     ╱      ╲      Test user workflows
    ╱        ╲
   ╱──────────╲    Integration Tests (15%)
  ╱  API Routes╲   Mock DB, external services
 ╱       Tests  ╲  Verify module interactions
╱────────────────╲
│   Unit Tests    │  Unit Tests (80%)
│   (80% Coverage)│  Jest, isolated logic
│                 │  Fast, focused tests
└─────────────────┘
```

**Strategy for QConnect**:
1. **Unit Tests (80%)**: Core utilities, helpers, logging
2. **Integration Tests (15%)**: API routes, database interactions
3. **E2E Tests (5%)**: Critical user journeys (booking, authentication)

---

## Setting Up Mock Service Worker (MSW)

### Step 1: Installation

```bash
npm install --save-dev msw
```

### Step 2: Create MSW Server

The MSW server file is already created at `__tests__/setup/msw-server.ts` with handlers for:
- Users API (`/api/users`)
- Appointments API (`/api/appointments`)
- Doctors API (`/api/doctors`)
- Authentication (`/api/auth/login`, `/api/auth/signup`, `/api/auth/me`)
- Email API (`/api/email`)

### Step 3: Configure Jest Setup

Update `jest.setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { server } from './__tests__/setup/msw-server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
```

### Step 4: Override Handlers in Tests

For specific tests, you can override default handlers:

```typescript
import { server } from '@/__tests__/setup/msw-server';
import { http, HttpResponse } from 'msw';

describe('Custom Behavior', () => {
  it('should handle custom scenario', async () => {
    // Override default handler for this test
    server.use(
      http.post('*/api/users', () => {
        return HttpResponse.json(
          { error: 'Server error' },
          { status: 500 }
        );
      })
    );

    // Your test here
  });
});
```

---

## Integration Test Examples

### Example 1: Testing User Creation API

```typescript
/**
 * Integration Test: User Creation
 * Verifies POST /api/users creates user correctly
 */

import { POST } from '@/app/api/users/route';

describe('POST /api/users - User Creation', () => {
  it('should create a new user successfully', async () => {
    const req = new Request('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'secure_password_123',
        phone: '+1234567890',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    // Assert success response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data.email).toBe('alice@example.com');
    expect(data.data.role).toBe('patient');

    // Assert message
    expect(data.message).toContain('created successfully');
  });

  it('should reject user creation without required fields', async () => {
    const req = new Request('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bob Smith',
        // email and password missing
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('VALIDATION_ERROR');
    expect(data.message).toContain('required fields');
  });

  it('should handle database errors gracefully', async () => {
    // Override handler to simulate database error
    server.use(
      http.post('*/api/users', () => {
        return HttpResponse.json(
          {
            success: false,
            error: 'DATABASE_ERROR',
            message: 'Failed to create user',
          },
          { status: 500 }
        );
      })
    );

    const req = new Request('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'password',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
```

### Example 2: Testing Appointment Booking Flow

```typescript
/**
 * Integration Test: Appointment Booking
 * Verifies complete booking workflow
 */

import { POST } from '@/app/api/appointments/route';

describe('POST /api/appointments - Booking Workflow', () => {
  it('should book appointment with valid doctor and date', async () => {
    const appointmentData = {
      doctorId: 'user_1',
      date: '2024-02-15T14:00:00Z',
      duration: 30,
      reason: 'Annual checkup',
    };

    const req = new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data.doctorId).toBe('user_1');
    expect(data.data.status).toBe('pending');
  });

  it('should validate appointment date is in the future', async () => {
    const pastDate = new Date(Date.now() - 86400000); // Yesterday

    server.use(
      http.post('*/api/appointments', async ({ request }) => {
        const body = await request.json();
        
        if (new Date(body.date) < new Date()) {
          return HttpResponse.json(
            {
              success: false,
              error: 'INVALID_DATE',
              message: 'Appointment date must be in the future',
            },
            { status: 400 }
          );
        }

        return HttpResponse.json({ success: true });
      })
    );

    const req = new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        doctorId: 'user_1',
        date: pastDate.toISOString(),
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('INVALID_DATE');
  });

  it('should handle doctor not found', async () => {
    server.use(
      http.post('*/api/appointments', async ({ request }) => {
        const body = await request.json();
        
        if (body.doctorId === 'invalid_doctor_id') {
          return HttpResponse.json(
            {
              success: false,
              error: 'DOCTOR_NOT_FOUND',
              message: 'Doctor not found',
            },
            { status: 404 }
          );
        }

        return HttpResponse.json({ success: true });
      })
    );

    const req = new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        doctorId: 'invalid_doctor_id',
        date: new Date(Date.now() + 86400000).toISOString(),
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('DOCTOR_NOT_FOUND');
  });
});
```

### Example 3: Testing Authentication Flow

```typescript
/**
 * Integration Test: Authentication
 * Verifies login and token generation
 */

import { POST as loginPOST } from '@/app/api/auth/login/route';

describe('POST /api/auth/login - Authentication', () => {
  it('should successfully login with valid credentials', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'jane@example.com',
        password: 'secure_password',
      }),
    });

    const response = await loginPOST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('token');
    expect(data.data.user.email).toBe('jane@example.com');
    expect(data.data.user).toHaveProperty('role');
  });

  it('should reject invalid credentials', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrong_password',
      }),
    });

    const response = await loginPOST(req);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('INVALID_CREDENTIALS');
  });

  it('should require email and password', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        // password missing
      }),
    });

    const response = await loginPOST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('VALIDATION_ERROR');
  });
});
```

### Example 4: Testing Email Sending Integration

```typescript
/**
 * Integration Test: Email Sending
 * Verifies email API with provider fallback
 */

import { POST } from '@/app/api/email/route';

describe('POST /api/email - Email Integration', () => {
  it('should send email through SES', async () => {
    const req = new Request('http://localhost:3000/api/email', {
      method: 'POST',
      body: JSON.stringify({
        to: 'patient@example.com',
        subject: 'Appointment Confirmation',
        message: '<h2>Your appointment is confirmed</h2>',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('messageId');
    expect(data.provider).toBe('ses');
  });

  it('should handle email validation errors', async () => {
    const req = new Request('http://localhost:3000/api/email', {
      method: 'POST',
      body: JSON.stringify({
        to: 'invalid-email',
        subject: 'Test',
        message: 'Test message',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    // Should return 400 for invalid email
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('should fallback gracefully on email service failure', async () => {
    server.use(
      http.post('*/api/email', () => {
        return HttpResponse.json(
          {
            success: false,
            error: 'EMAIL_SERVICE_ERROR',
            message: 'Failed to send email',
          },
          { status: 503 }
        );
      })
    );

    const req = new Request('http://localhost:3000/api/email', {
      method: 'POST',
      body: JSON.stringify({
        to: 'user@example.com',
        subject: 'Test',
        message: 'Test',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
  });
});
```

---

## Best Practices

### 1. **Use Descriptive Test Names**

```typescript
// ✅ Good: Describes behavior and scenario
it('should return 400 when booking appointment without doctorId', () => {});
it('should create user with role "patient" by default', () => {});
it('should send confirmation email after appointment booking', () => {});

// ❌ Bad: Vague, doesn't describe expected behavior
it('test appointment', () => {});
it('test user creation', () => {});
it('test email', () => {});
```

### 2. **Follow AAA Pattern**

```typescript
it('should update user phone number', async () => {
  // ARRANGE: Setup test data
  const userId = 'user_1';
  const newPhone = '+1987654321';

  // ACT: Execute the action
  const req = new Request(`http://localhost:3000/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ phone: newPhone }),
  });
  const response = await PUT(req);
  const data = await response.json();

  // ASSERT: Verify the result
  expect(response.status).toBe(200);
  expect(data.data.phone).toBe(newPhone);
});
```

### 3. **Test Both Happy Path and Error Cases**

```typescript
describe('API Endpoint', () => {
  // Happy path
  it('should handle valid request', async () => {
    // Test successful scenario
  });

  // Error paths
  it('should reject invalid input', async () => {});
  it('should handle missing required fields', async () => {});
  it('should handle resource not found', async () => {});
  it('should handle server errors', async () => {});
});
```

### 4. **Mock External Dependencies**

```typescript
// Use MSW to mock external APIs
server.use(
  http.post('*/api/email', () => {
    return HttpResponse.json(
      { error: 'Service unavailable' },
      { status: 503 }
    );
  })
);

// Or mock Prisma directly
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
```

### 5. **Test Request/Response Contracts**

```typescript
it('should return consistent response structure', async () => {
  const response = await POST(req);
  const data = await response.json();

  // Always verify structure
  expect(data).toHaveProperty('success');
  expect(data).toHaveProperty('data');
  expect(data).toHaveProperty('message');

  // Verify data types
  expect(typeof data.success).toBe('boolean');
  expect(typeof data.data).toBe('object');
  expect(typeof data.message).toBe('string');
});
```

### 6. **Clean Up After Tests**

```typescript
describe('API Tests', () => {
  afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset MSW handlers
    server.resetHandlers();
  });

  // Tests here
});
```

### 7. **Avoid Test Interdependence**

```typescript
// ❌ Bad: Tests depend on each other
describe('User API', () => {
  let userId;

  it('should create user', async () => {
    // ... userId = response.data.id
  });

  it('should fetch user', async () => {
    // Uses userId from previous test
    const response = await GET(`/api/users/${userId}`);
  });
});

// ✅ Good: Each test is independent
describe('User API', () => {
  it('should create and fetch user', async () => {
    // Create
    const createReq = new Request('...', { method: 'POST', ... });
    const createResp = await POST(createReq);
    const userId = createResp.data.id;

    // Fetch
    const getReq = new Request(`/api/users/${userId}`, { method: 'GET' });
    const getResp = await GET(getReq);

    expect(getResp.status).toBe(200);
  });
});
```

---

## Running Integration Tests

### Run All Integration Tests

```bash
npm test -- __tests__/api
```

### Run Specific Test File

```bash
npm test -- __tests__/api/users.test.ts
```

### Run with Coverage

```bash
npm test -- __tests__/api --coverage
```

### Watch Mode (Auto-rerun on changes)

```bash
npm test -- __tests__/api --watch
```

### Verbose Output

```bash
npm test -- __tests__/api --verbose
```

---

## Advanced Scenarios

### Scenario 1: Testing Pagination

```typescript
describe('GET /api/users - Pagination', () => {
  it('should paginate results correctly', async () => {
    const req = new Request(
      'http://localhost:3000/api/users?page=2&limit=5'
    );

    const response = await GET(req);
    const data = await response.json();

    expect(data.data.page).toBe(2);
    expect(data.data.limit).toBe(5);
    expect(data.data.data.length).toBeLessThanOrEqual(5);
    expect(data.data.total).toBeGreaterThan(0);
  });

  it('should handle invalid page numbers', async () => {
    const req = new Request(
      'http://localhost:3000/api/users?page=0&limit=10'
    );

    const response = await GET(req);
    const data = await response.json();

    // Should default to page 1
    expect(data.data.page).toBe(1);
  });
});
```

### Scenario 2: Testing with Authentication Headers

```typescript
describe('Protected Routes', () => {
  it('should require authentication header', async () => {
    const req = new Request('http://localhost:3000/api/appointments', {
      method: 'GET',
      // No authorization header
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(401);
  });

  it('should access route with valid token', async () => {
    const req = new Request('http://localhost:3000/api/appointments', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid_jwt_token',
      },
    });

    const response = await GET(req);
    
    expect(response.status).toBe(200);
  });
});
```

### Scenario 3: Testing Concurrent Requests

```typescript
describe('Concurrent Operations', () => {
  it('should handle multiple user creations concurrently', async () => {
    const createUser = (email) => {
      const req = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          name: 'User',
          email,
          password: 'password',
        }),
      });
      return POST(req);
    };

    const responses = await Promise.all([
      createUser('user1@example.com'),
      createUser('user2@example.com'),
      createUser('user3@example.com'),
    ]);

    expect(responses).toHaveLength(3);
    expect(responses.every(r => r.status === 200)).toBe(true);
  });
});
```

### Scenario 4: Testing Data Validation

```typescript
describe('Data Validation', () => {
  it('should validate email format', async () => {
    const invalidEmails = [
      'not-an-email',
      'missing@domain',
      '@nodomain.com',
    ];

    for (const email of invalidEmails) {
      const req = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          name: 'User',
          email,
          password: 'password',
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    }
  });

  it('should validate password strength', async () => {
    const weakPasswords = ['123', 'abc', 'password'];

    for (const pwd of weakPasswords) {
      const req = new Request('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          name: 'User',
          email: 'user@example.com',
          password: pwd,
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    }
  });
});
```

---

## Troubleshooting

### Issue: MSW Handlers Not Being Called

**Solution**: Ensure MSW server is started before tests run:

```typescript
// jest.setup.ts
import { server } from './__tests__/setup/msw-server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Issue: Test Timeout

**Solution**: Increase timeout for slow operations:

```typescript
it('should complete slow operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### Issue: Mocked Handler Not Applied

**Solution**: Make sure to override handlers BEFORE making the request:

```typescript
it('test', async () => {
  // ✅ Correct: Override before request
  server.use(http.post('*/api/users', () => { /* ... */ }));
  const response = await POST(req);

  // ❌ Wrong: Override after request
  server.use(http.post('*/api/users', () => { /* ... */ }));
});
```

### Issue: State Leaking Between Tests

**Solution**: Always reset state in `afterEach`:

```typescript
afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
});
```

---

## Coverage Goals

### Target Coverage by Component

| Component | Target | Achieved |
|-----------|--------|----------|
| API Routes | 85%+ | - |
| Middleware | 80%+ | - |
| Error Handlers | 90%+ | - |
| Validation | 95%+ | - |
| **Global** | **80%** | **82.5%** |

### Improvement Path

**Week 1** (Complete): Unit tests (82.5%)
**Week 2** (In Progress): Integration tests (target: 85%)
**Week 3**: E2E tests (target: 88%)
**Week 4**: Final coverage push (target: 90%)

---

## Next Steps

### Week 2 Tasks
- [ ] Write integration tests for all API routes
- [ ] Add tests for error scenarios
- [ ] Test authentication flows
- [ ] Mock database operations with Prisma
- [ ] Target: 85%+ coverage

### Week 3 Tasks
- [ ] Setup Cypress for E2E testing
- [ ] Test complete user workflows (booking, auth)
- [ ] Add visual regression tests
- [ ] Performance testing

### Week 4 Tasks
- [ ] Final coverage optimization
- [ ] CI/CD integration
- [ ] Production readiness
- [ ] Documentation review

---

## References

- **MSW Documentation**: https://mswjs.io/docs/getting-started
- **Jest API**: https://jestjs.io/docs/api
- **Next.js Testing**: https://nextjs.org/docs/testing
- **React Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

## Key Takeaways

✅ **Integration tests verify module interactions**  
✅ **MSW provides powerful API mocking**  
✅ **Test behavior, not implementation**  
✅ **Follow AAA pattern for clarity**  
✅ **Test both success and error cases**  
✅ **Keep tests focused and isolated**  
✅ **Aim for 80%+ coverage**  

---

**Last Updated**: January 17, 2026  
**Status**: Complete ✅  
**Next Review**: After Week 2 integration tests completed
