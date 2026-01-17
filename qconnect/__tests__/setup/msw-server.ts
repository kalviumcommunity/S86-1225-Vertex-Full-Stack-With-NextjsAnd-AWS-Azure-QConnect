/**
 * Mock Service Worker (MSW) Server Setup
 * Provides mocked API endpoints for integration testing
 * 
 * Installation:
 * npm install --save-dev msw
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

/**
 * Define API handlers for mocking external services and database calls
 * These handlers intercept HTTP requests and return mocked responses
 */
export const handlers = [
  // =====================
  // Users API Endpoints
  // =====================
  
  // GET /api/users - List all users
  http.get('*/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    return HttpResponse.json({
      success: true,
      data: {
        page,
        limit,
        total: 25,
        data: [
          {
            id: 'user_1',
            name: 'Dr. John Smith',
            email: 'john@example.com',
            phone: '+1234567890',
            role: 'doctor',
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user_2',
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '+0987654321',
            role: 'patient',
            createdAt: '2024-01-02T00:00:00Z',
          },
        ],
      },
      message: 'Users fetched successfully',
    });
  }),

  // POST /api/users - Create new user
  http.post('*/api/users', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    
    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Missing required fields: name, email, password',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'user_' + Date.now(),
        name: body.name,
        email: body.email,
        role: 'patient',
        createdAt: new Date().toISOString(),
      },
      message: 'User created successfully',
    });
  }),

  // GET /api/users/:id - Get specific user
  http.get('*/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: 'Dr. John Smith',
        email: 'john@example.com',
        phone: '+1234567890',
        role: 'doctor',
        createdAt: '2024-01-01T00:00:00Z',
      },
      message: 'User fetched successfully',
    });
  }),

  // PUT /api/users/:id - Update user
  http.put('*/api/users/:id', async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;

    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: body.name || 'Updated Name',
        email: body.email || 'updated@example.com',
        phone: body.phone || '+1234567890',
        role: body.role || 'patient',
        updatedAt: new Date().toISOString(),
      },
      message: 'User updated successfully',
    });
  }),

  // DELETE /api/users/:id - Delete user
  http.delete('*/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: `User ${params.id} deleted successfully`,
    });
  }),

  // =====================
  // Appointments API Endpoints
  // =====================

  // GET /api/appointments - List appointments
  http.get('*/api/appointments', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    return HttpResponse.json({
      success: true,
      data: {
        page,
        limit,
        total: 15,
        data: [
          {
            id: 'apt_1',
            userId: 'user_2',
            doctorId: 'user_1',
            date: '2024-02-01T10:00:00Z',
            duration: 30,
            status: 'confirmed',
            reason: 'Regular checkup',
            createdAt: '2024-01-15T00:00:00Z',
          },
        ],
      },
      message: 'Appointments fetched successfully',
    });
  }),

  // POST /api/appointments - Create appointment
  http.post('*/api/appointments', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    if (!body.doctorId || !body.date) {
      return HttpResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Missing required fields: doctorId, date',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'apt_' + Date.now(),
        doctorId: body.doctorId,
        date: body.date,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      message: 'Appointment created successfully',
    });
  }),

  // GET /api/appointments/:id - Get appointment
  http.get('*/api/appointments/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        userId: 'user_2',
        doctorId: 'user_1',
        date: '2024-02-01T10:00:00Z',
        status: 'confirmed',
        createdAt: '2024-01-15T00:00:00Z',
      },
      message: 'Appointment fetched successfully',
    });
  }),

  // PUT /api/appointments/:id - Update appointment
  http.put('*/api/appointments/:id', async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;

    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        status: body.status || 'confirmed',
        updatedAt: new Date().toISOString(),
      },
      message: 'Appointment updated successfully',
    });
  }),

  // DELETE /api/appointments/:id - Delete appointment
  http.delete('*/api/appointments/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      message: `Appointment ${params.id} cancelled successfully`,
    });
  }),

  // =====================
  // Doctors API Endpoints
  // =====================

  // GET /api/doctors - List doctors with specialization filter
  http.get('*/api/doctors', ({ request }) => {
    const url = new URL(request.url);
    const specialization = url.searchParams.get('specialization');

    return HttpResponse.json({
      success: true,
      data: {
        total: 10,
        data: [
          {
            id: 'user_1',
            name: 'Dr. John Smith',
            email: 'john@example.com',
            specialization: 'Cardiology',
            experience: 12,
            rating: 4.8,
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user_3',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@example.com',
            specialization: 'Dermatology',
            experience: 8,
            rating: 4.6,
            createdAt: '2024-01-03T00:00:00Z',
          },
        ],
      },
      message: 'Doctors fetched successfully',
    });
  }),

  // GET /api/doctors/:id - Get doctor details
  http.get('*/api/doctors/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: 'Dr. John Smith',
        email: 'john@example.com',
        specialization: 'Cardiology',
        experience: 12,
        rating: 4.8,
        bio: 'Experienced cardiologist with 12 years of practice',
      },
      message: 'Doctor fetched successfully',
    });
  }),

  // =====================
  // Authentication Endpoints
  // =====================

  // POST /api/auth/login - User login
  http.post('*/api/auth/login', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Invalid credentials
    if (body.email === 'invalid@example.com') {
      return HttpResponse.json(
        {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        token: 'jwt_token_' + Date.now(),
        user: {
          id: 'user_2',
          email: body.email,
          role: 'patient',
        },
      },
      message: 'Login successful',
    });
  }),

  // POST /api/auth/signup - User registration
  http.post('*/api/auth/signup', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Name, email, and password are required',
        },
        { status: 400 }
      );
    }

    // Email already exists
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        {
          success: false,
          error: 'EMAIL_EXISTS',
          message: 'Email already registered',
        },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: 'user_' + Date.now(),
          name: body.name,
          email: body.email,
          role: 'patient',
        },
        token: 'jwt_token_' + Date.now(),
      },
      message: 'Registration successful',
    });
  }),

  // GET /api/auth/me - Get current user
  http.get('*/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Missing authorization header',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: 'user_2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'patient',
      },
      message: 'User fetched successfully',
    });
  }),

  // =====================
  // Email API Endpoint
  // =====================

  // POST /api/email - Send email
  http.post('*/api/email', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;

    if (!body.to || !body.subject || !body.message) {
      return HttpResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Missing required fields: to, subject, message',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      messageId: 'msg_' + Date.now(),
      provider: 'ses',
      message: 'Email sent successfully',
    });
  }),
];

/**
 * Setup MSW server with handlers
 * Used in test setup files to intercept HTTP requests
 */
export const server = setupServer(...handlers);
