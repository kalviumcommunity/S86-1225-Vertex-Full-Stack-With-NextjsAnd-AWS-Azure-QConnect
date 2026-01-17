# QConnect - Project Plan & MVP Document

**Project Name**: QConnect  
**Duration**: 4 Weeks (20 working days)  
**Date Created**: January 17, 2026  
**Status**: Active Sprint

---

## 1. Problem Statement & Solution Overview

### Problem Statement

Healthcare providers and patients face significant challenges in managing appointments efficiently:

- **Patients**: Struggle to find available appointment slots, track multiple bookings, and receive timely reminders, leading to missed appointments (no-show rates of 20-30%).
- **Doctors/Healthcare Providers**: Lack centralized scheduling systems, resulting in double-bookings, manual confirmation processes, and poor resource utilization.
- **Healthcare Facilities**: Incur revenue loss from no-shows and spend excessive time managing appointments manually.

### Why This Problem Matters

- **Economic Impact**: Healthcare no-shows cost the industry billions annually in lost revenue.
- **Patient Experience**: Poor appointment management leads to frustration and reduced patient satisfaction.
- **Provider Efficiency**: Manual scheduling wastes time that could be spent on patient care.
- **Market Opportunity**: Growing demand for digital health solutions, especially post-pandemic.

### Target Users

1. **Primary Users**: Patients seeking healthcare services
2. **Secondary Users**: Healthcare providers (doctors, clinics, hospitals)
3. **Tertiary Users**: Clinic administrators managing operations

### Proposed Solution

**QConnect** is a full-stack web application that provides:

- **For Patients**: 
  - Easy online appointment booking with availability visibility
  - Email reminders and notifications
  - Appointment history and management
  - Doctor profiles and specialization search

- **For Providers**: 
  - Appointment calendar management
  - Patient profiles and medical history
  - Automated reminders to reduce no-shows
  - Analytics dashboard for utilization metrics

- **Core Technology**:
  - Next.js 16 frontend with React 19
  - PostgreSQL database with Prisma ORM
  - AWS services (SES for emails, S3 for files)
  - JWT-based authentication
  - RESTful API architecture

### Value Proposition

| User Type | Value Delivered |
|-----------|-----------------|
| **Patients** | Save time booking appointments, receive timely reminders, access doctor profiles |
| **Doctors** | Automated scheduling, reduced no-shows, improved patient management |
| **Facilities** | Increased appointment completion rates, better resource planning |

---

## 2. Scope & Boundaries

### ✅ In Scope (MVP Features)

#### Authentication & User Management
- User registration and email verification
- Login/logout with JWT tokens
- Role-based access control (Patient, Doctor, Admin)
- Profile management (personal info, contact details)
- Password reset functionality

#### Appointment Management
- Browse available doctors/appointment slots
- Create/book appointments (CRUD)
- Cancel appointments (with notice period)
- Reschedule appointments
- View appointment history
- Appointment status tracking (confirmed, completed, cancelled)

#### Doctor Management
- Doctor profile management
- Doctor availability/schedule setup
- Specialization and qualification display
- Doctor search and filtering

#### Notifications & Communication
- Email confirmations on appointment booking
- Appointment reminders (24 hours before)
- Password reset emails
- Cancellation confirmations

#### Dashboard & Analytics
- Patient dashboard (upcoming appointments, past bookings)
- Doctor dashboard (schedule view, appointments list)
- Admin dashboard (system overview, user management)
- Basic appointment analytics

#### File Management
- Profile photo uploads (AWS S3)
- Document uploads for medical records (future enhancement)

### ❌ Out of Scope (Future Phases)

- Mobile native apps (iOS/Android) — Web-responsive only
- Video consultation integration
- Payment processing and billing
- Insurance verification
- Telemedicine/Live chat features
- Advanced analytics and reporting
- Multi-language support
- Prescription management
- Lab reports integration
- Third-party calendar sync (Google Calendar, Outlook)
- SMS notifications (email only in MVP)

### Constraints

| Constraint | Details |
|-----------|---------|
| **Time** | 4 weeks / 20 working days |
| **Team Size** | 3-4 members with defined roles |
| **Budget** | Use free/low-cost AWS services (SES free tier, S3 free tier) |
| **Infrastructure** | AWS-based, containerized with Docker |
| **Database** | PostgreSQL (single instance, no sharding) |
| **Users** | Design for 1,000+ users in MVP (scalable to 10,000+) |

---

## 3. Roles & Responsibilities

### Team Structure

| Role | Team Member | Key Responsibilities | Estimated % Time |
|------|-------------|----------------------|------------------|
| **Project Lead** | Laksh | Overall project coordination, sprint planning, stakeholder communication, code review | 20% |
| **Backend Lead** | Backend Dev | API development, database schema, authentication, business logic, testing | 100% |
| **Frontend Lead** | Frontend Dev | UI/UX implementation, component development, API integration, responsive design | 100% |
| **DevOps/QA** | QA/DevOps | CI/CD setup, deployment, testing strategy, documentation, environment config | 100% |
| **Database Admin** | Backend Dev | Database design, migrations, optimization, backup strategy | 20% |

### Role-Specific Deliverables

#### Backend Lead
- Design and implement REST APIs for all core features
- Set up PostgreSQL schema with Prisma migrations
- Implement JWT authentication and role-based access
- Create email service integration (using sendEmail utility)
- Write unit and integration tests (Jest)
- API documentation (OpenAPI/Swagger format)
- Database optimization and indexing

#### Frontend Lead
- Design and develop React components (dashboard, forms, etc.)
- Implement responsive UI using Tailwind CSS
- Integrate with backend APIs using SWR/Fetch
- Create authentication flow (login, signup, password reset)
- Handle client-side validation and error handling
- Performance optimization (lazy loading, code splitting)
- Component-level unit tests

#### DevOps/QA
- Set up GitHub Actions CI/CD pipeline
- Docker containerization and Docker Compose orchestration
- Deploy to AWS (ECS, EC2, or local container registry)
- Create test coverage reports
- Performance testing and load testing
- Documentation (setup guides, API docs, deployment steps)
- Monitor logs and error tracking

#### Project Lead
- Sprint planning and daily standups
- Manage blockers and risks
- Coordinate across team members
- Prepare demos and documentation
- Ensure quality standards

---

## 4. Sprint Timeline (4 Weeks)

### Week 1: Setup, Planning & Design

**Focus**: Environment setup, architecture finalization, database design

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| 1-2 | Project setup, dependencies, environment config | DevOps | Docker, docker-compose, .env files ready |
| 2-3 | Database schema design & ER diagram | Backend | Prisma schema, migration files |
| 3-4 | API design & endpoint specification | Backend | OpenAPI spec, endpoint list |
| 4 | Frontend component structure & design system | Frontend | Figma design, component list |
| 5 | CI/CD pipeline setup, deployment strategy | DevOps | GitHub Actions workflow, deployment docs |

**Week 1 Milestones**:
- ✅ Development environment fully set up
- ✅ Database schema finalized and migrated
- ✅ API specification documented
- ✅ CI/CD pipeline functional
- ✅ Project structure and folder organization complete

**End of Week 1 Status**: Ready for core development

---

### Week 2: Core Development (APIs & UI)

**Focus**: Implement core features and essential UI

#### Backend Development
| Feature | Owner | Status |
|---------|-------|--------|
| User Authentication (signup, login, JWT) | Backend | Core |
| User Profile CRUD | Backend | Core |
| Doctor Profile & Search API | Backend | Core |
| Appointment Booking API | Backend | Core |
| Appointment Management (view, cancel, reschedule) | Backend | Core |
| Dashboard APIs (patient, doctor, admin) | Backend | Core |

#### Frontend Development
| Component | Owner | Status |
|-----------|-------|--------|
| Authentication Pages (Login, Signup, Password Reset) | Frontend | Core |
| User Profile Page | Frontend | Core |
| Doctor Search & Listing | Frontend | Core |
| Appointment Booking Form | Frontend | Core |
| Patient Dashboard | Frontend | Core |
| Doctor Dashboard (Basic) | Frontend | Core |
| Navbar & Footer | Frontend | Core |

#### Integration & Testing
| Task | Owner | Status |
|------|-------|--------|
| API unit tests (50+ test cases) | Backend | Core |
| Component unit tests | Frontend | Core |
| Mock data setup for frontend testing | Backend | Core |

**Week 2 Milestones**:
- ✅ All core APIs functional and tested
- ✅ Authentication fully implemented (signup, login, JWT)
- ✅ Core UI pages built and responsive
- ✅ Basic API-UI integration working
- ✅ Test coverage >70%

**End of Week 2 Status**: Core functionality working, integration begins

---

### Week 3: Integration, Testing & Refinement

**Focus**: End-to-end integration, comprehensive testing, error handling

#### Frontend-Backend Integration
| Task | Owner | Status |
|------|-------|--------|
| Connect all API endpoints to UI | Frontend | Core |
| Implement error handling and validation | Frontend | Core |
| Add loading states and toasts (Sonner) | Frontend | Core |
| Test complete user flows | Frontend | Core |

#### Testing & Quality Assurance
| Task | Owner | Status |
|------|-------|--------|
| Integration tests (E2E workflows) | QA/Backend | Core |
| Email notification testing | QA/Backend | Core |
| Performance testing & optimization | QA | Core |
| Security audit (SQL injection, XSS, CSRF) | QA | Core |
| Cross-browser testing (Chrome, Firefox, Safari) | QA | Core |

#### Bug Fixes & Polish
| Task | Owner | Status |
|------|-------|--------|
| Fix critical bugs from integration testing | Backend/Frontend | Core |
| Improve UI/UX based on testing feedback | Frontend | Core |
| Optimize database queries | Backend | Core |
| Add error boundaries and fallback pages | Frontend | Core |

**Week 3 Milestones**:
- ✅ Complete end-to-end user flows working
- ✅ Email notifications sending correctly
- ✅ All critical bugs fixed
- ✅ Performance baseline met (API response <300ms)
- ✅ Test coverage >80%

**End of Week 3 Status**: MVP feature-complete, ready for deployment

---

### Week 4: Finalization, Documentation & Deployment

**Focus**: Polish, documentation, production deployment, demo preparation

#### Final Feature Refinement
| Task | Owner | Status |
|------|-------|--------|
| Dashboard analytics implementation | Backend | Core |
| Final UI/UX polish | Frontend | Core |
| Admin panel functionality | Backend | Core |
| Optimize bundle size | Frontend | Core |

#### Documentation & Knowledge Transfer
| Task | Owner | Status |
|------|-------|--------|
| API documentation (Swagger/OpenAPI) | Backend | Core |
| Setup and deployment guide | DevOps | Core |
| User manual/help documentation | Lead | Core |
| Code documentation and comments | All | Core |
| Team handoff documentation | Lead | Core |

#### Testing & Deployment
| Task | Owner | Status |
|------|-------|--------|
| Staging environment testing | QA | Core |
| Production deployment preparation | DevOps | Core |
| Database backup & recovery testing | DevOps | Core |
| Final security check | QA | Core |
| Deploy to production | DevOps | Core |

#### Demo Preparation
| Task | Owner | Status |
|------|-------|--------|
| Prepare demo scenarios and test data | Lead | Core |
| Create demo presentation deck | Lead | Core |
| Record demo video (optional) | Lead | Core |
| Prepare Q&A responses | Lead | Core |

**Week 4 Milestones**:
- ✅ MVP feature freeze (no new features, only fixes)
- ✅ All documentation complete
- ✅ Successfully deployed to production
- ✅ Demo prepared and tested
- ✅ Handoff complete

**End of Week 4 Status**: MVP Live in Production ✅

---

## 5. Deployment and Testing Plan

### Testing Strategy

#### Unit Testing
- **Framework**: Jest + React Testing Library
- **Coverage Target**: >80% code coverage
- **Scope**:
  - API endpoint testing (all CRUD operations)
  - Utility function testing
  - Component rendering and user interactions
  - Form validation logic

**Command**:
```bash
npm test
npm run test:coverage
```

#### Integration Testing
- **Framework**: Jest (for API route testing)
- **Approach**:
  - Test complete user flows (signup → login → book appointment)
  - Mock external services (email, file storage)
  - Test error scenarios and edge cases

**Sample Test File**:
```typescript
// __tests__/api/appointments.test.ts
describe("POST /api/appointments", () => {
  it("should create appointment and send confirmation email", async () => {
    // Test flow
  });
});
```

#### End-to-End Testing
- **Manual Testing**: All critical user flows tested in staging
- **Test Scenarios**:
  1. User registration and email verification
  2. Doctor search and appointment booking
  3. Appointment cancellation and rescheduling
  4. Email notifications (signup, booking, reminder)
  5. Error handling (invalid input, duplicate booking)

#### Performance Testing
- **Metrics**:
  - API response time: < 300ms (p95)
  - Page load time: < 2s (initial)
  - Database query optimization: indexes on frequently queried fields

**Tools**: 
- Lighthouse for frontend performance
- Prisma query optimization

#### Security Testing
- **Checklist**:
  - SQL Injection prevention (Prisma parameterized queries)
  - XSS prevention (HTML sanitization)
  - CSRF protection (CSRF tokens)
  - Password hashing (bcrypt)
  - JWT token validation
  - Role-based access control (RBAC) enforcement

### Deployment Strategy

#### Environment Setup

**Development**:
```bash
npm install
cp .env.example .env
npm run migrate:dev
npm run dev
```

**Staging**:
- Separate database (staging)
- Test email service (sandbox mode)
- Simulated production environment

**Production**:
- Production database with backups
- Real email service (SES production)
- AWS infrastructure (ECS/EC2)

#### Containerization
```dockerfile
# Dockerfile for QConnect
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### CI/CD Pipeline (GitHub Actions)

```yaml
name: QConnect CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npm test
      - run: npm run test:coverage

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v2
      - run: docker build -t qconnect:${{ github.sha }} .
      - run: docker push qconnect:${{ github.sha }}

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to AWS
        run: |
          aws ecs update-service \
            --cluster qconnect-cluster \
            --service qconnect-service \
            --force-new-deployment
```

#### Deployment Steps

1. **Pre-Deployment**:
   - Backup production database
   - Create snapshot of current state
   - Prepare rollback plan

2. **Deployment**:
   - Run database migrations (on staging first)
   - Update environment variables
   - Deploy new container image
   - Run smoke tests
   - Monitor error logs

3. **Post-Deployment**:
   - Verify all APIs responding
   - Check email service connectivity
   - Monitor performance metrics
   - Get team signoff

### Rollback Plan

If deployment fails:
1. Revert to previous container image
2. Restore database from backup
3. Notify team and stakeholders
4. Post-mortem analysis

---

## 6. MVP (Minimum Viable Product)

### MVP Definition

The MVP is a **fully functional, deployable healthcare appointment system** with core features that directly address the problem statement. It's **not perfect** but is **production-ready and user-focused**.

### MVP Feature List

#### Tier 1: Must Have (Critical for MVP)

| Feature | Description | User Value | Owner |
|---------|-------------|-----------|-------|
| **User Authentication** | Signup, login, logout, password reset | Enable secure access | Backend |
| **Patient Profile** | Create and manage patient profile | Users can complete profiles | Backend/Frontend |
| **Doctor Profile** | Doctor listings with specialization | Patients can find doctors | Backend/Frontend |
| **Appointment Booking** | Search, select slots, and book appointments | Core value - schedule appointments | Backend/Frontend |
| **Appointment Management** | View, cancel, reschedule appointments | Users can manage bookings | Backend/Frontend |
| **Email Notifications** | Booking confirmations, reminders | Reduce no-shows | Backend |
| **Dashboard** | Patient and doctor dashboards | Centralized view of appointments | Frontend |
| **Admin Panel** | User and appointment management | Facility oversight | Backend/Frontend |

#### Tier 2: Should Have (High Value, Time Permitting)

| Feature | Description | Owner |
|---------|-------------|-------|
| **Appointment Analytics** | Basic stats (bookings, no-shows) | Backend/Frontend |
| **Doctor Availability** | Manage schedule and availability | Backend/Frontend |
| **Payment Status** | Mark appointments as paid/unpaid | Backend |
| **File Upload** | Profile photos, documents (S3) | Backend |

#### Tier 3: Nice to Have (Deferred to Phase 2)

| Feature | Description |
|---------|-------------|
| Advanced analytics and reporting | Business insights |
| SMS notifications | Alternative to email |
| Video consultation | Telemedicine |
| Insurance verification | Payment processing |
| Mobile app | Dedicated mobile experience |

### MVP Scope Summary

- **User Types**: Patient, Doctor, Admin
- **Core Workflows**: Register → Search Doctor → Book → Confirm → Receive Reminder → Attend
- **Data Entities**: User, Doctor, Appointment, Profile
- **APIs**: 20+ REST endpoints
- **UI Pages**: 15+ pages (responsive design)
- **Test Coverage**: >80%
- **Deployment**: Docker + AWS

### MVP Success Criteria

✅ All Tier 1 features fully functional  
✅ >80% code coverage with tests  
✅ Zero critical bugs in production  
✅ API response time <300ms  
✅ All user flows documented and tested  
✅ Email notifications sending reliably  
✅ Responsive design on mobile/tablet/desktop  
✅ Database migrations and backups working  
✅ CI/CD pipeline functional  
✅ Team can demonstrate all features  

---

## 7. Core Project Components

### Authentication & User Management

#### Pages
- **Sign Up Page** (`/signup`)
  - Email, password, user type (patient/doctor)
  - Email verification link sent
  - Error handling and validation
  
- **Sign In Page** (`/login`)
  - Email and password login
  - "Remember me" option
  - Error messages for invalid credentials
  
- **Password Reset** (`/forgot-password`, `/reset-password`)
  - Email-based reset link
  - New password setup
  - Confirmation email

- **User Profile** (`/profile`)
  - Edit personal information
  - Change password
  - Upload profile photo

#### API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `PUT /api/auth/reset-password` - Reset password with token
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

---

### Core Application (Post-Login)

#### Patient Dashboard (`/dashboard/patient`)
- **Upcoming Appointments**: Display next 3 appointments
- **Recent Bookings**: List last 5 appointments
- **Quick Actions**: Book appointment, View history
- **Stats**: Total bookings, completed, cancelled

#### Doctor Dashboard (`/dashboard/doctor`)
- **Today's Schedule**: Appointments for today
- **Upcoming Appointments**: Next 7 days
- **Patient Queue**: Waiting patients
- **Availability Settings**: Set/update schedule

#### Admin Dashboard (`/dashboard/admin`)
- **System Stats**: Total users, doctors, appointments
- **Recent Activity**: New registrations, bookings
- **Manage Users**: List, edit, deactivate users
- **Manage Doctors**: List, approve, deactivate doctors

#### Appointment Management Pages

- **Doctor Search & Browse** (`/doctors`)
  - List all doctors with filters (specialization, rating)
  - Doctor detail view (qualifications, availability, reviews)

- **Book Appointment** (`/appointments/book`)
  - Select doctor and preferred date
  - Choose available time slot
  - Confirm and pay (or mark as pending)
  - Receive confirmation email

- **Appointment History** (`/appointments`)
  - List all past and upcoming appointments
  - Filter by status (upcoming, completed, cancelled)
  - Cancel or reschedule appointments

- **Appointment Details** (`/appointments/:id`)
  - View full appointment information
  - Doctor details and location
  - Patient notes and medical history
  - Action buttons (cancel, reschedule)

---

### General Pages & Components

#### Public Pages
- **Home Page** (`/`)
  - Hero section with value proposition
  - Feature highlights
  - How it works (3 steps)
  - Testimonials/reviews
  - Call-to-action buttons (Sign up, Login)

- **Navbar**
  - Logo and branding
  - Navigation links (Home, About, Contact)
  - User menu (Profile, Settings, Logout) when logged in
  - Mobile hamburger menu

- **Footer**
  - Links (Privacy, Terms, Contact)
  - Social media links
  - Copyright info

#### Optional Pages (MVP Plus)
- **About Page** (`/about`)
  - Company mission and vision
  - Team information

- **Contact Page** (`/contact`)
  - Contact form (name, email, message)
  - Submit to backend for follow-up

- **FAQ Page** (`/faq`)
  - Common questions and answers

---

### Components Architecture

```
src/components/
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Layout.tsx
├── forms/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── AppointmentForm.tsx
│   └── ProfileForm.tsx
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   └── Toast.tsx
├── dashboard/
│   ├── PatientDashboard.tsx
│   ├── DoctorDashboard.tsx
│   └── AdminDashboard.tsx
├── appointments/
│   ├── AppointmentList.tsx
│   ├── AppointmentCard.tsx
│   └── AppointmentForm.tsx
└── doctors/
    ├── DoctorList.tsx
    ├── DoctorCard.tsx
    └── DoctorDetail.tsx
```

---

## 8. Functional Requirements

### Authentication & Authorization (F1)

| Req ID | Requirement | Acceptance Criteria |
|--------|-------------|-------------------|
| F1.1 | User signup with email and password | User can register; email verification sent; account created in DB |
| F1.2 | Email verification | User must verify email before accessing app |
| F1.3 | User login | User can login with valid credentials; JWT token issued |
| F1.4 | JWT token management | Token stored securely; auto-refresh before expiry; revoked on logout |
| F1.5 | Role-based access | Patient, Doctor, Admin roles enforced; users see only permitted content |
| F1.6 | Password reset | User can reset password via email link; link expires after 24 hours |

### User Management (F2)

| Req ID | Requirement | Acceptance Criteria |
|--------|-------------|-------------------|
| F2.1 | User profile creation | User can create/edit profile (name, email, phone, address) |
| F2.2 | Doctor profile | Doctor profile includes specialization, qualifications, availability |
| F2.3 | Profile photo upload | User can upload profile photo to S3; display on profile page |
| F2.4 | Account deactivation | User can deactivate account; data retained but account inactive |

### Appointment Management (F3)

| Req ID | Requirement | Acceptance Criteria |
|--------|-------------|-------------------|
| F3.1 | Doctor search | Patient can search doctors by specialization, name, availability |
| F3.2 | View availability | Show available time slots for selected doctor and date |
| F3.3 | Book appointment | Patient can select slot and confirm booking; appointment created in DB |
| F3.4 | Appointment confirmation | Confirmation email sent to patient and doctor within 5 seconds |
| F3.5 | Cancel appointment | Patient/Doctor can cancel with reason; notification sent |
| F3.6 | Reschedule appointment | Patient can change date/time; updated confirmation sent |
| F3.7 | Appointment history | User can view past and upcoming appointments with filters |
| F3.8 | Appointment status | Track status: scheduled, confirmed, completed, cancelled, no-show |

### Notifications (F4)

| Req ID | Requirement | Acceptance Criteria |
|--------|-------------|-------------------|
| F4.1 | Signup confirmation email | Email sent within 5 sec; includes verification link |
| F4.2 | Appointment booking email | Confirmation email sent to patient and doctor |
| F4.3 | Appointment reminder | 24-hour reminder email sent before appointment |
| F4.4 | Cancellation notification | Email sent to both patient and doctor on cancellation |
| F4.5 | Password reset email | Reset link sent securely; valid for 24 hours |

### Dashboard & Analytics (F5)

| Req ID | Requirement | Acceptance Criteria |
|--------|-------------|-------------------|
| F5.1 | Patient dashboard | Display upcoming appointments, stats, quick actions |
| F5.2 | Doctor dashboard | Display schedule, today's appointments, availability settings |
| F5.3 | Admin dashboard | System overview, user management, basic analytics |
| F5.4 | Appointment analytics | Count of bookings, no-shows, average ratings (basic) |

---

## 9. Non-Functional Requirements

### Performance (NFR1)

| Req ID | Requirement | Target |
|--------|-------------|--------|
| NFR1.1 | API response time | < 300ms (p95 latency) for all endpoints |
| NFR1.2 | Page load time | < 2 seconds for initial page load |
| NFR1.3 | Search performance | Doctor search results within 500ms (even with 10K doctors) |
| NFR1.4 | Database query optimization | Proper indexing on frequent queries (email, doctor ID, appointment date) |
| NFR1.5 | Bundle size | Frontend JS bundle < 250KB (gzipped) |

### Scalability (NFR2)

| Req ID | Requirement | Target |
|--------|-------------|--------|
| NFR2.1 | Concurrent users | Support 100+ concurrent users during MVP |
| NFR2.2 | Data volume | Handle 10K+ users, 1K+ doctors, 100K+ appointments |
| NFR2.3 | Horizontal scaling | Architecture allows adding more app servers if needed |
| NFR2.4 | Database scalability | PostgreSQL can handle current data; sharding plan ready for Phase 2 |

### Security (NFR3)

| Req ID | Requirement | Implementation |
|--------|-------------|-----------------|
| NFR3.1 | Password encryption | bcrypt hashing with salt rounds = 10 |
| NFR3.2 | Data in transit | HTTPS/TLS for all communication |
| NFR3.3 | Data at rest | Encrypted database credentials, no hardcoded secrets |
| NFR3.4 | SQL injection prevention | Parameterized queries (Prisma ORM) |
| NFR3.5 | XSS prevention | HTML sanitization, input validation, Content Security Policy |
| NFR3.6 | CSRF protection | CSRF tokens on state-changing requests |
| NFR3.7 | Rate limiting | API rate limiting (100 req/min per IP) |
| NFR3.8 | Secrets management | Use .env files, never commit credentials |

### Reliability (NFR4)

| Req ID | Requirement | Implementation |
|--------|-------------|-----------------|
| NFR4.1 | Uptime target | 99.5% availability (max 3.6 hours downtime/month) |
| NFR4.2 | Data backup | Daily automated backups of PostgreSQL database |
| NFR4.3 | Disaster recovery | Tested restore procedure; RTO < 1 hour |
| NFR4.4 | Error handling | Graceful error messages; no 500 errors exposed to users |
| NFR4.5 | Logging | Comprehensive logging of errors, access, transactions |

### Maintainability (NFR5)

| Req ID | Requirement | Implementation |
|--------|-------------|-----------------|
| NFR5.1 | Code quality | ESLint, Prettier, TypeScript strict mode |
| NFR5.2 | Test coverage | >80% code coverage with Jest |
| NFR5.3 | Documentation | API docs (Swagger), code comments, setup guides |
| NFR5.4 | CI/CD automation | GitHub Actions for automated testing and deployment |

### Usability (NFR6)

| Req ID | Requirement | Implementation |
|--------|-------------|-----------------|
| NFR6.1 | Responsive design | Mobile (320px), Tablet (768px), Desktop (1920px) |
| NFR6.2 | Accessibility | WCAG 2.1 Level AA compliant (alt text, proper headings, keyboard navigation) |
| NFR6.3 | Load time | First contentful paint < 1.5 seconds |
| NFR6.4 | Error messages | Clear, actionable error messages (not technical jargon) |

---

## 10. Success Metrics

### Development Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Code Coverage** | >80% | Jest coverage report |
| **Test Pass Rate** | 100% | CI/CD pipeline status |
| **Build Success Rate** | 100% | GitHub Actions logs |
| **Critical Bugs** | 0 in production | Bug tracker |
| **PR Review Time** | <24 hours | GitHub PR metrics |

### Feature Completion Metrics

| Milestone | Target | Status |
|-----------|--------|--------|
| **Week 1**: Setup & Design | 100% | ✅ Environment ready |
| **Week 2**: Core Development | 100% | ✅ All core APIs & UI built |
| **Week 3**: Integration & Testing | 100% | ✅ E2E flows working |
| **Week 4**: Deployment | 100% | ✅ MVP live in production |

### Quality Metrics

| Metric | Target | Tool |
|--------|--------|------|
| **API Response Time** | <300ms (p95) | APM monitoring (CloudWatch) |
| **Page Load Time** | <2s | Lighthouse, WebPageTest |
| **Error Rate** | <0.1% | Application logs |
| **Test Execution Time** | <5 minutes | CI/CD pipeline |

### User-Centric Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Feature Completeness** | 100% of Tier 1 features | Feature checklist |
| **User Flow Success** | 95%+ (no errors) | Manual testing + user feedback |
| **Demo Success** | All features working end-to-end | Successful demonstration |
| **Documentation Quality** | Complete and clear | Peer review |

### Business Metrics (Post-Launch)

| Metric | Target | Timeline |
|--------|--------|----------|
| **User Adoption** | 100+ users in first week | Post-launch tracking |
| **Appointment Completion Rate** | >80% (reduce no-shows) | Analytics dashboard |
| **User Satisfaction** | 4+ / 5 stars | Feedback survey |
| **System Uptime** | 99%+ | Monitoring alerts |

---

## 11. Risks & Mitigation

### Technical Risks

| Risk | Impact | Probability | Mitigation Plan |
|------|--------|-------------|-----------------|
| **Database Migration Issues** | Data loss, app downtime | Medium | Test migrations in staging; backup before each migration; have rollback plan |
| **Email Service Integration Fails** | Notifications not sent, bad UX | Low | Mock email service during development; test with real SES sandbox early |
| **API/Frontend Integration Delays** | Frontend blocked, schedule slip | Medium | Create mock APIs early; parallel development; clear API contracts |
| **Performance Issues in Testing** | Unmet performance targets | Medium | Profile early; optimize queries; use indexing; load test in Week 3 |
| **Third-party Service Outage (AWS)** | Partial or full downtime | Low | Use fallback notification method; alert users; document SLA expectations |

### Resource Risks

| Risk | Impact | Probability | Mitigation Plan |
|------|--------|-------------|-----------------|
| **Team Member Unavailability** | Scope delay, incomplete work | Low | Cross-train team members; pair programming; detailed documentation |
| **Scope Creep** | Miss MVP deadline | Medium | Strict feature gating (Tier 1 only); say "No" to Tier 2/3 features in Week 1-3 |
| **Skill Gaps** | Quality issues, slow development | Low | Pre-sprint training on Next.js, Prisma, AWS; pair with experienced developer |
| **Communication Breakdown** | Misaligned deliverables, rework | Low | Daily standups; shared project board; clear acceptance criteria |

### External Risks

| Risk | Impact | Probability | Mitigation Plan |
|------|--------|-------------|-----------------|
| **Unclear Requirements** | Wrong features built, rework | Medium | Detailed requirement gathering in Week 1; stakeholder sign-off |
| **Stakeholder Changes in Mid-Sprint** | Scope changes, confusion | Low | Weekly stakeholder meetings; document all decisions; change control process |
| **AWS Service Limits** | Can't deploy or scale | Low | Request limit increases early; monitor usage; use free tier carefully |

### Mitigation Strategy Summary

1. **Communication**: Daily standups, weekly stakeholder reviews, shared visibility
2. **Testing**: Test early and often; automate testing; catch issues early
3. **Documentation**: Document decisions, APIs, setup; reduce knowledge silos
4. **Risk Monitoring**: Weekly risk review; track blockers on project board
5. **Contingency**: Prioritize features (Tier 1/2/3); have fallback plans
6. **Escalation Path**: Clear process for unblocking team; project lead as escalation owner

---

## 12. Team Communication Plan

### Daily Standup
- **Time**: 10:00 AM (15 minutes)
- **Format**: Async Slack + optional sync call if blockers
- **Topics**: What done yesterday? What doing today? Blockers?

### Weekly Sync
- **Time**: Every Friday 4:00 PM (1 hour)
- **Format**: Video call
- **Agenda**: Progress review, blockers, next week priorities, demo updates

### Stakeholder Demo
- **Time**: End of each week (Friday 5:00 PM)
- **Format**: Live demo of working features
- **Audience**: Project lead, stakeholders, mentors

### Incident Response
- **Critical Issue**: Immediate Slack notification + sync call
- **P1 Bug**: Fix within 4 hours
- **P2 Bug**: Fix within 24 hours
- **P3 Bug**: Fix by end of week

---

## 13. Definition of Done (DoD)

A feature/task is "Done" only when:

✅ Code written and peer-reviewed  
✅ Tests written (unit + integration) with >80% coverage  
✅ Code passes linting (ESLint, Prettier)  
✅ All required documentation added (comments, API docs)  
✅ Tested in staging environment  
✅ No critical or high-priority bugs  
✅ Approved by code reviewer  
✅ Merged to main branch  

---

## 14. Success Criteria & Acceptance

### MVP Launch Success Criteria

- ✅ All Tier 1 features deployed and working in production
- ✅ >80% test coverage with all tests passing
- ✅ Zero P0 (critical) bugs
- ✅ API response time <300ms (p95)
- ✅ Email notifications reliable (>99% delivery)
- ✅ Responsive design on mobile/tablet/desktop
- ✅ Complete documentation and team handoff
- ✅ Successful live demo with all features showcased
- ✅ Team trained on deployment and operations
- ✅ Monitoring and alerting in place

### Sign-Off Checklist

| Item | Owner | Status |
|------|-------|--------|
| Code complete and tested | Backend/Frontend | |
| Deployment successful | DevOps | |
| All APIs documented | Backend | |
| Demo executed successfully | Lead | |
| User manual completed | Lead | |
| Team trained on operations | DevOps | |
| Stakeholder approval | Project Lead | |

---

## 15. Appendix: Tools & Technologies

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: JWT, bcrypt
- **File Storage**: AWS S3
- **Email**: AWS SES
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions
- **Deployment**: Docker, AWS (ECS/EC2)
- **Monitoring**: CloudWatch, Sentry (optional)

### Development Tools
- **Version Control**: Git, GitHub
- **Project Management**: GitHub Projects / Linear
- **Communication**: Slack, GitHub Discussions
- **API Testing**: Postman, cURL
- **Code Quality**: ESLint, Prettier, SonarQube (optional)

### Resources & Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [AWS SES Setup Guide](https://docs.aws.amazon.com/ses)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
- [QConnect Architecture Document](ARCHITECTURE.md)
- [Email Service Guide](README.md#email-service-integration)

---

## Conclusion

This Project Plan is a **living document** — it will evolve based on learnings and feedback throughout the sprint. 

**Key Takeaways**:
1. **Focus on MVP**: Deliver Tier 1 features with quality, not quantity
2. **Communication**: Daily sync + weekly demos keep everyone aligned
3. **Testing Early**: Catch issues before they compound
4. **Document Everything**: Future teams will thank you
5. **Adapt & Learn**: Retrospectives drive continuous improvement

**Next Steps**:
- [ ] Distribute plan to team (this document)
- [ ] Hold kickoff meeting and get team alignment
- [ ] Set up development environment
- [ ] Begin database schema design
- [ ] Finalize API specifications

---

**Document Version**: 1.0  
**Last Updated**: January 17, 2026  
**Status**: Ready for Sprint Kickoff ✅

For questions or updates, contact the Project Lead.
