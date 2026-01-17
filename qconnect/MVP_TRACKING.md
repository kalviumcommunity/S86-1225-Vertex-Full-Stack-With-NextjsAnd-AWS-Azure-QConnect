# QConnect MVP - Feature Tracking & Progress Board

**Sprint Duration**: 4 Weeks (Jan 17 - Feb 14, 2026)  
**Last Updated**: January 17, 2026  
**Status**: Sprint Kickoff

---

## 📊 MVP Feature Matrix

### Legend
- 🟡 **Not Started**: Task not yet begun
- 🔵 **In Progress**: Currently being worked on
- ✅ **Complete**: Finished and tested
- ⚠️ **Blocked**: Waiting on dependency
- 🔴 **At Risk**: May miss deadline

---

## TIER 1: MUST HAVE FEATURES ⭐

### Week 1: Foundation & Setup

#### Frontend Setup
| Feature | Status | Owner | Est. Hrs | Notes |
|---------|--------|-------|----------|-------|
| Project structure & Tailwind setup | 🟡 | Frontend | 4 | |
| Component library scaffold | 🟡 | Frontend | 4 | Button, Input, Card, Modal |
| Routing setup (Next.js) | 🟡 | Frontend | 2 | App Router configured |
| Auth context setup | 🟡 | Frontend | 3 | AuthContext, useAuth hook |
| API client setup (fetch/SWR) | 🟡 | Frontend | 3 | Fetcher utility, error handling |

#### Backend Setup
| Feature | Status | Owner | Est. Hrs | Notes |
|---------|--------|-------|----------|-------|
| Prisma schema design | 🟡 | Backend | 6 | User, Doctor, Appointment models |
| Database migrations | 🟡 | Backend | 2 | Create initial schema |
| API folder structure | 🟡 | Backend | 2 | /app/api routes organized |
| Logger setup | 🟡 | Backend | 2 | Winston or custom logger |
| Error handling middleware | 🟡 | Backend | 3 | Centralized error handling |

#### DevOps/Infra
| Feature | Status | Owner | Est. Hrs | Notes |
|---------|--------|-------|----------|-------|
| Docker & Docker Compose | 🟡 | DevOps | 4 | Development containers |
| Environment variables setup | 🟡 | DevOps | 2 | .env.example, .env files |
| GitHub Actions CI/CD basic | 🟡 | DevOps | 5 | Linting, testing, build |

---

### Week 2: Core Features - Phase 1

#### Authentication & User Management
| Feature | Status | Owner | Est. Hrs | Done Date |
|---------|--------|-------|----------|-----------|
| POST /api/auth/signup | 🟡 | Backend | 6 | |
| POST /api/auth/login | 🟡 | Backend | 4 | |
| POST /api/auth/logout | 🟡 | Backend | 2 | |
| JWT token management | 🟡 | Backend | 4 | Refresh, expiry, revoke |
| Email verification flow | 🟡 | Backend | 5 | Send link, verify token |
| Password reset flow | 🟡 | Backend | 5 | Send link, validate, update |
| RBAC middleware | 🟡 | Backend | 4 | Patient, Doctor, Admin roles |
| **Frontend: Login Page** | 🟡 | Frontend | 5 | Email/password, errors, validation |
| **Frontend: Signup Page** | 🟡 | Frontend | 6 | User type selection, role logic |
| **Frontend: Password Reset** | 🟡 | Frontend | 4 | Forgot & reset flows |

#### User Profile Management
| Feature | Status | Owner | Est. Hrs | Done Date |
|---------|--------|-------|----------|-----------|
| GET /api/users/:id | 🟡 | Backend | 3 | Fetch user profile |
| PUT /api/users/:id | 🟡 | Backend | 4 | Update user details |
| GET /api/doctors | 🟡 | Backend | 4 | List all doctors |
| GET /api/doctors/:id | 🟡 | Backend | 3 | Doctor detail + availability |
| POST /api/doctors/:id/availability | 🟡 | Backend | 5 | Set availability schedule |
| **Frontend: User Profile Page** | 🟡 | Frontend | 5 | View/edit profile |
| **Frontend: Doctor Profile Page** | 🟡 | Frontend | 4 | Doctor details, qualifications |

#### Appointment Management - Core
| Feature | Status | Owner | Est. Hrs | Done Date |
|---------|--------|-------|----------|-----------|
| GET /api/appointments/available-slots | 🟡 | Backend | 6 | List available time slots |
| POST /api/appointments | 🟡 | Backend | 6 | Create appointment |
| GET /api/appointments | 🟡 | Backend | 4 | List appointments (filtered) |
| GET /api/appointments/:id | 🟡 | Backend | 3 | Appointment details |
| PUT /api/appointments/:id/status | 🟡 | Backend | 3 | Update status (confirm, complete) |
| DELETE /api/appointments/:id | 🟡 | Backend | 3 | Cancel appointment |
| **Frontend: Doctor Search** | 🟡 | Frontend | 6 | Search, filter, list doctors |
| **Frontend: Book Appointment** | 🟡 | Frontend | 8 | Select doctor, date, time, confirm |
| **Frontend: Appointment List** | 🟡 | Frontend | 5 | View upcoming/past appointments |

#### Email Notifications (Using sendEmail)
| Feature | Status | Owner | Est. Hrs | Done Date |
|---------|--------|-------|----------|-----------|
| Signup confirmation email | 🟡 | Backend | 3 | Via sendEmail utility |
| Appointment booking email | 🟡 | Backend | 3 | Confirmation + details |
| Appointment reminder (24hr) | 🟡 | Backend | 4 | Scheduled job (cron) |
| Cancellation email | 🟡 | Backend | 2 | To both patient and doctor |
| Password reset email | 🟡 | Backend | 2 | Via sendEmail utility |
| **Test Email Service** | 🟡 | QA | 3 | Verify all emails sending |

#### Tests (Week 2 Start)
| Test Suite | Status | Owner | Est. Hrs | Coverage |
|-----------|--------|-------|----------|----------|
| Auth API tests | 🟡 | Backend | 8 | signup, login, password reset |
| User API tests | 🟡 | Backend | 4 | GET/PUT user profile |
| Appointment API tests | 🟡 | Backend | 10 | CRUD + business logic |
| Component tests (UI) | 🟡 | Frontend | 6 | Forms, buttons, layouts |

---

### Week 3: Integration & Refinement

#### Dashboard Implementation
| Feature | Status | Owner | Est. Hrs | Done Date |
|---------|--------|-------|----------|-----------|
| **Patient Dashboard** | 🟡 | Frontend | 6 | Upcoming appts, stats, quick actions |
| **Doctor Dashboard** | 🟡 | Frontend | 6 | Today's schedule, upcoming, availability |
| **Admin Dashboard** (Basic) | 🟡 | Frontend | 5 | System stats, user list |

#### Frontend-Backend Integration
| Feature | Status | Owner | Est. Hrs | Done Date |
|---------|--------|-------|----------|-----------|
| Connect Auth pages to API | 🟡 | Frontend | 4 | Signup, login, password reset flows |
| Connect Doctor search to API | 🟡 | Frontend | 3 | Search, filter, list |
| Connect Appointment booking to API | 🟡 | Frontend | 5 | Full booking flow end-to-end |
| Error handling & validation | 🟡 | Frontend | 4 | Show errors, retry logic |
| Loading states & toasts | 🟡 | Frontend | 3 | Sonner toast notifications |

#### Testing & Quality Assurance
| Task | Status | Owner | Est. Hrs | Done Date |
|------|--------|-------|----------|-----------|
| End-to-end testing (manual) | 🟡 | QA | 8 | User registration → appointment |
| Integration tests (API + DB) | 🟡 | Backend | 8 | Full workflows, mocking |
| Performance testing | 🟡 | QA | 4 | API response time, page load |
| Security testing | 🟡 | QA | 4 | SQL injection, XSS, CSRF |
| Email notification testing | 🟡 | QA | 3 | All email flows verified |

#### Bug Fixes & Polish
| Category | Status | Owner | Est. Hrs | Notes |
|----------|--------|-------|----------|-------|
| Critical bugs | 🟡 | All | 8 | Fix blocking issues |
| Minor UI/UX improvements | 🟡 | Frontend | 4 | Layout, spacing, colors |
| Database query optimization | 🟡 | Backend | 4 | Add indexes, optimize queries |

---

### Week 4: Finalization & Deployment

#### Final Features & Polish
| Feature | Status | Owner | Est. Hrs | Done Date |
|---------|--------|-------|----------|-----------|
| Admin user management | 🟡 | Backend | 5 | Create, edit, deactivate users |
| Admin user management UI | 🟡 | Frontend | 4 | User list, edit form |
| Appointment analytics (basic) | 🟡 | Backend | 4 | Count stats, no-show rate |
| File uploads (S3) | 🟡 | Backend | 4 | Profile photos, documents |
| File upload UI | 🟡 | Frontend | 3 | Upload form, preview |

#### Documentation & Knowledge Transfer
| Task | Status | Owner | Est. Hrs | Done Date |
|------|--------|-------|----------|-----------|
| API documentation (Swagger) | 🟡 | Backend | 4 | OpenAPI spec, endpoint docs |
| Deployment guide | 🟡 | DevOps | 3 | Setup, config, troubleshooting |
| User manual & FAQ | 🟡 | Lead | 4 | How to use app |
| Code documentation | 🟡 | All | 3 | Comments, README, architecture |
| Team runbook | 🟡 | DevOps | 2 | Operations, monitoring, alerts |

#### Staging & Production Deployment
| Task | Status | Owner | Est. Hrs | Done Date |
|------|--------|-------|----------|-----------|
| Staging environment | 🟡 | DevOps | 4 | Separate DB, full deployment |
| Staging testing | 🟡 | QA | 6 | Full E2E testing before prod |
| Production database setup | 🟡 | DevOps | 3 | Backup, recovery, monitoring |
| Production deployment | 🟡 | DevOps | 3 | Docker push, ECS update |
| Post-deployment validation | 🟡 | QA | 2 | Smoke tests, verify all working |
| Rollback procedure testing | 🟡 | DevOps | 2 | Verify can rollback if needed |

#### Demo Preparation
| Task | Status | Owner | Est. Hrs | Done Date |
|------|--------|-------|----------|-----------|
| Demo script & scenarios | 🟡 | Lead | 3 | User flows to demonstrate |
| Test data setup | 🟡 | Backend | 2 | Sample users, doctors, appointments |
| Presentation deck | 🟡 | Lead | 2 | Slides covering MVP features |
| Demo dry-run | 🟡 | Lead | 2 | Practice all flows, timing |

---

## TIER 2: SHOULD HAVE (If Time Permits)

| Feature | Status | Owner | Est. Hrs | Priority |
|---------|--------|-------|----------|----------|
| Appointment analytics dashboard | 🟡 | Frontend | 6 | P2 |
| Doctor availability calendar view | 🟡 | Frontend | 5 | P2 |
| User ratings/reviews | 🟡 | Backend/Frontend | 8 | P2 |
| Appointment payment status | 🟡 | Backend | 4 | P2 |
| SMS notifications (via SNS) | 🟡 | Backend | 6 | P2 |
| Two-factor authentication | 🟡 | Backend | 6 | P2 |

---

## TIER 3: NICE TO HAVE (Phase 2)

| Feature | Owner | Notes |
|---------|-------|-------|
| Video consultation | Backend | Requires Zoom/Twilio integration |
| Mobile app (React Native/Flutter) | Frontend | Separate project |
| Advanced analytics & reporting | Backend | Business intelligence |
| Insurance verification | Backend | Integration with providers |
| Payment processing (Stripe/Razorpay) | Backend | PCI compliance required |
| SMS notifications | Backend | Via Twilio or AWS SNS |

---

## 📈 Weekly Progress Tracking

### Week 1 Progress (Jan 17-21)

**Target**: Setup complete, architecture finalized

| Deliverable | Target | Actual | Status |
|-------------|--------|--------|--------|
| Environment setup | ✅ | 🟡 | In Progress |
| Prisma schema | ✅ | 🟡 | In Progress |
| API design doc | ✅ | 🟡 | Pending |
| CI/CD pipeline | ✅ | 🟡 | Pending |
| Component structure | ✅ | 🟡 | Pending |

**Week 1 Blockers**: (None yet - update as needed)

---

### Week 2 Progress (Jan 24-28)

**Target**: Core APIs built, primary UI components ready

| Deliverable | Target | Actual | Status |
|-------------|--------|--------|--------|
| Auth APIs complete | ✅ | 🟡 | Not Started |
| Appointment APIs complete | ✅ | 🟡 | Not Started |
| Dashboard UI | ✅ | 🟡 | Not Started |
| Email service working | ✅ | 🟡 | Not Started |
| 50+ unit tests | ✅ | 🟡 | Not Started |

**Week 2 Blockers**: (To be filled in)

---

### Week 3 Progress (Jan 31 - Feb 4)

**Target**: Full integration, comprehensive testing

| Deliverable | Target | Actual | Status |
|-------------|--------|--------|--------|
| API-UI integration | ✅ | 🟡 | Not Started |
| E2E flows working | ✅ | 🟡 | Not Started |
| Test coverage >80% | ✅ | 🟡 | Not Started |
| Staging environment | ✅ | 🟡 | Not Started |
| Critical bugs fixed | ✅ | 🟡 | Not Started |

**Week 3 Blockers**: (To be filled in)

---

### Week 4 Progress (Feb 7-11)

**Target**: MVP feature freeze, production deployment

| Deliverable | Target | Actual | Status |
|-------------|--------|--------|--------|
| All documentation | ✅ | 🟡 | Not Started |
| Production deployment | ✅ | 🟡 | Not Started |
| Demo successful | ✅ | 🟡 | Not Started |
| Zero P0 bugs | ✅ | 🟡 | Not Started |
| Team trained | ✅ | 🟡 | Not Started |

**Week 4 Blockers**: (To be filled in)

---

## 🎯 Daily Standup Tracker

### Template (to fill daily)

```markdown
Date: [Day]

[Team Member Name]:
- ✅ Completed: [Task 1], [Task 2]
- 🔵 In Progress: [Task 1], [Task 2]
- 🟡 Blocked: [Issue], Needs help from [Person]
- 📅 Today's Plan: [Tasks for today]

[Team Member Name]:
- ✅ Completed: [...]
- 🔵 In Progress: [...]
- 🟡 Blocked: [...]
- 📅 Today's Plan: [...]
```

---

## 🚨 Risk & Blocker Tracker

| Issue ID | Description | Status | Owner | Resolution |
|----------|-------------|--------|-------|------------|
| RISK-001 | Email service integration | 🟡 | Backend | Monitor SES setup; use sendEmail utility |
| RISK-002 | API-UI contract changes | 🟡 | All | Clear API spec before coding starts |
| RISK-003 | Database migration issues | 🟡 | Backend | Test migrations in staging first |

---

## ✅ Definition of Done Checklist

- [ ] Code written and reviewed
- [ ] Unit tests passing (>80% coverage)
- [ ] Linting and formatting pass (ESLint, Prettier)
- [ ] API documented (if backend)
- [ ] Component documented (if frontend)
- [ ] Tested in local environment
- [ ] Tested in staging environment
- [ ] No critical bugs
- [ ] PR approved and merged
- [ ] Deployed to main branch

---

## 📊 Burndown Chart (Track Weekly)

```
Tasks Completed by Week:
Week 1: ████░░░░░░ 40%
Week 2: ████████░░ 80%
Week 3: █████████░ 90%
Week 4: ██████████ 100%

Ideal Line:
└─┬─────────────────────────
  │╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱
  └────────────────────────── Complete
```

---

## 🎯 Success Criteria (Week by Week)

### Week 1 Success ✅
- Environment setup complete (Docker, Next.js, DB)
- Prisma schema finalized
- API design document approved
- CI/CD pipeline functional
- Team aligned on architecture

### Week 2 Success ✅
- All core APIs built (Auth, Appointments, Users)
- Primary UI pages created
- Email service integrated
- 50+ unit tests written
- Code coverage >70%

### Week 3 Success ✅
- End-to-end user flows working
- Email notifications tested and working
- Test coverage >80%
- Performance targets met
- Staging environment ready

### Week 4 Success ✅
- MVP feature freeze (only bug fixes)
- All documentation complete
- Production deployment successful
- Demo executed flawlessly
- Team trained and ready

---

## 📋 Completed Features Log

(Update as features are completed)

- [ ] User signup & authentication
- [ ] User login & JWT
- [ ] Password reset flow
- [ ] User profile management
- [ ] Doctor search & filtering
- [ ] Doctor profiles
- [ ] Appointment booking
- [ ] Appointment management (view, cancel, reschedule)
- [ ] Email notifications (all types)
- [ ] Patient dashboard
- [ ] Doctor dashboard
- [ ] Admin dashboard
- [ ] File uploads (S3)
- [ ] Analytics (basic)
- [ ] Documentation complete
- [ ] Production deployment

---

## 🔗 Related Documents

- [PROJECT_PLAN.md](PROJECT_PLAN.md) - Comprehensive project plan
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [README.md](README.md) - Project overview and setup
- [EMAIL_SERVICE_IMPLEMENTATION.md](EMAIL_SERVICE_IMPLEMENTATION.md) - Email setup

---

**Status**: 🟡 Sprint Kickoff - Ready to Begin  
**Last Updated**: January 17, 2026  
**Next Review**: January 20, 2026 (End of Week 1)

---

For updates or questions, contact the Project Lead.
