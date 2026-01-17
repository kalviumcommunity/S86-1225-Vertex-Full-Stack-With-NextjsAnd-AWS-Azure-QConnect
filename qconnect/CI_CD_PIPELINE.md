# GitHub Actions CI/CD Pipeline

**Date**: January 17, 2026  
**Status**: ✅ Complete  
**Version**: 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Pipeline Architecture](#pipeline-architecture)
3. [Workflow Stages](#workflow-stages)
4. [Configuration Details](#configuration-details)
5. [Secrets & Environment Variables](#secrets--environment-variables)
6. [Running the Pipeline](#running-the-pipeline)
7. [Monitoring & Debugging](#monitoring--debugging)
8. [Performance Optimization](#performance-optimization)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The CI/CD pipeline automates the entire development workflow, ensuring code quality, testing, and deployment consistency. Every push or pull request triggers automatic validation across multiple stages.

### Pipeline Triggers

```yaml
on:
  push:
    branches: [main, develop]      # Triggers on commits to main/develop
  pull_request:
    branches: [main, develop]      # Triggers on PR creation/updates
  workflow_dispatch:               # Manual trigger via GitHub UI
```

### Key Features

✅ **Automated Linting**: ESLint checks code style  
✅ **Unit Tests**: Jest runs with 80%+ coverage requirement  
✅ **Integration Tests**: API route testing with MSW  
✅ **Build Verification**: Ensures Next.js builds successfully  
✅ **Deployment Automation**: Auto-deploy to production on main branch  
✅ **Coverage Reporting**: Codecov integration for coverage tracking  
✅ **Concurrency Control**: Prevents overlapping runs  
✅ **Artifact Storage**: Preserves build and test results  

---

## Pipeline Architecture

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Event (Push/PR)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │    LINT Stage       │  (Code quality checks)
                │ - ESLint            │
                │ - TypeScript Check  │
                └──────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐    ┌──────▼──────┐    ┌─────▼──────┐
  │TEST Stage │    │BUILD Stage  │    │INTEGRATION │
  │ - Jest    │    │ - Next.js   │    │TESTS       │
  │ - RTL     │    │ - Coverage  │    │ - MSW      │
  └─────┬─────┘    └──────┬──────┘    └─────┬──────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                ┌──────────▼──────────┐
                │  CI Status Check    │
                │ - All passed?       │
                │ - Generate summary  │
                └──────────┬──────────┘
                           │
              ┌────────────▼────────────┐
              │ Is Main Branch & Push?  │
              └────────┬───────┬────────┘
                  Yes  │       │  No
              ┌────────▼──┐   └─────────┐
              │   DEPLOY  │             │
              │- Production│             │
              │ - Health   │      (End)  │
              │   Check    │             │
              └────────────┘             │
                       │                │
                └──────▼────────────────┘
                  (Pipeline Complete)
```

### Job Dependencies

```
lint (no dependencies)
├── test (needs: lint)
├── build (needs: lint)
├── integration-tests (needs: lint)
└── deploy (needs: test, build, integration-tests)
    (only on main branch push)
```

---

## Workflow Stages

### Stage 1: LINT 🔍

**Purpose**: Validate code quality and style consistency

**Commands**:
```bash
npm run lint              # ESLint with next.js rules
npm run type-check       # TypeScript type checking
```

**Checks**:
- ✅ Code style consistency (ESLint)
- ✅ Type safety (TypeScript)
- ✅ Unused imports
- ✅ Code formatting

**Failure Behavior**: Fails the entire pipeline (continues on type-check errors)

**Duration**: ~30-45 seconds

### Stage 2: TEST ✅

**Purpose**: Run unit and integration tests with coverage validation

**Commands**:
```bash
npm test -- --coverage --ci    # Run all tests with coverage
```

**Coverage Requirements**:
- Lines: 80%+
- Branches: 80%+
- Functions: 80%+
- Statements: 80%+

**Tests Included**:
- ✅ Unit tests (80+ tests)
- ✅ API route tests (email, contact, users)
- ✅ Logger tests (35+ tests)
- ✅ Monitoring tests (40+ tests)

**Artifacts**:
- Coverage reports uploaded to Codecov
- Test results archived for 30 days

**Duration**: ~20-30 seconds

### Stage 3: BUILD 🏗️

**Purpose**: Verify application builds successfully for production

**Commands**:
```bash
npm run build    # Next.js production build
```

**Checks**:
- ✅ TypeScript compilation
- ✅ All imports resolve
- ✅ No syntax errors
- ✅ API routes valid
- ✅ Next.js optimization

**Artifacts**:
- `.next/` directory archived
- Build report generated

**Duration**: ~45-60 seconds

### Stage 4: INTEGRATION TESTS 🔗

**Purpose**: Test API routes with mocked external services

**Commands**:
```bash
npm test -- __tests__/api --ci
```

**Coverage**:
- Users API (55+ tests)
- Appointments API (35+ tests)
- Authentication API (40+ tests)
- Doctors API (30+ tests)
- Email API

**Uses**: Mock Service Worker (MSW) for API mocking

**Duration**: ~20-30 seconds

### Stage 5: DEPLOY 🚀

**Purpose**: Deploy to production on main branch

**Triggers**:
```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

**Steps**:
1. ✅ Build for production
2. ✅ Verify deployment
3. ✅ Send notifications
4. ✅ Generate deployment summary

**Environment**: Production
**Duration**: ~30-45 seconds

---

## Configuration Details

### Concurrency Settings

```yaml
concurrency:
  group: ${{ github.ref }}           # Group by branch name
  cancel-in-progress: true           # Cancel previous runs
```

**Effect**: Only one workflow runs per branch at a time. New pushes cancel previous runs.

### Caching Strategy

```yaml
cache: 'npm'    # Caches node_modules and package-lock.json
```

**Benefits**:
- ⚡ 50-70% faster npm installs
- 💾 Reduces bandwidth usage
- 🔒 Ensures consistent dependencies

### Environment Variables

```yaml
env:
  NODE_VERSION: '18'                           # Node.js version
  NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}  # Public API URL
```

---

## Secrets & Environment Variables

### Required Secrets

Add these in **Settings → Secrets and Variables → Actions**:

| Secret | Purpose | Required |
|--------|---------|----------|
| `NEXT_PUBLIC_API_URL` | API endpoint URL | Optional |
| `AWS_REGION` | AWS deployment region | Optional |
| `AWS_ACCESS_KEY_ID` | AWS authentication | Optional |
| `AWS_SECRET_ACCESS_KEY` | AWS authentication | Optional |
| `SLACK_WEBHOOK` | Slack notifications | Optional |
| `CODECOV_TOKEN` | Codecov.io token | Optional |

### Setting Secrets

1. Go to **GitHub Repository Settings**
2. Navigate to **Secrets and Variables → Actions**
3. Click **New repository secret**
4. Enter name and value:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://api.example.com
   ```
5. Click **Add secret**

### Accessing Secrets in Workflow

```yaml
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
```

**Security**: Secrets are masked in logs automatically

---

## Running the Pipeline

### Automatic Triggers

1. **On Push to main/develop**
   ```bash
   git push origin main
   # Automatically triggers workflow
   ```

2. **On Pull Request**
   ```bash
   git push origin feature-branch
   # Create PR against main/develop
   # Workflow triggers automatically
   ```

3. **Manual Trigger**
   - Go to **Actions tab**
   - Select **CI Pipeline**
   - Click **Run workflow**

### Monitoring in GitHub

1. Go to **Actions** tab in repository
2. Click **CI Pipeline**
3. Select a workflow run
4. View logs for each job

### Viewing Build Logs

**Per Job**:
```
Actions → CI Pipeline → [Run ID] → [Job Name] → [Step Name]
```

**Example**:
```
Actions → CI Pipeline → 456789 → Build Application → Build Next.js app
```

---

## Monitoring & Debugging

### GitHub Actions UI

**Workflow Runs Page**:
- ✅ Green checkmark: Success
- ❌ Red X: Failure
- 🟡 Yellow circle: In progress
- ⊘ Skipped: Condition not met

### Status Badges

Add to README:
```markdown
![CI Pipeline](https://github.com/YOUR-ORG/YOUR-REPO/actions/workflows/ci.yml/badge.svg)
```

### Job Summaries

Each job generates a summary in the Actions tab:
- Build details
- Test coverage
- Deployment status
- Links to artifacts

### Debugging Failed Workflows

1. **Check job logs**
   ```
   Actions → Failed Run → Job Name → Step Output
   ```

2. **Common issues**:
   - ❌ ESLint errors: `npm run lint` locally to fix
   - ❌ Test failures: `npm test` locally to debug
   - ❌ Build errors: `npm run build` locally to verify
   - ❌ Missing secrets: Add to Settings → Secrets

3. **Re-run failed jobs**
   ```
   Actions → Failed Run → Re-run failed jobs
   ```

---

## Performance Optimization

### 1. Caching

Current settings:
```yaml
uses: actions/setup-node@v4
with:
  cache: 'npm'    # Caches npm packages
```

**Result**: ~30-40% faster installs

### 2. Parallel Jobs

Jobs run in parallel when possible:
```
lint → (test, build, integration-tests in parallel)
```

**Duration Savings**: ~30-45 seconds saved

### 3. Dependency Management

```yaml
needs: [test, build, integration-tests]    # Deploy only after all pass
```

### 4. Artifact Cleanup

```yaml
retention-days: 30    # Auto-delete after 30 days
```

### 5. Skip Unnecessary Stages

```yaml
if: github.ref == 'refs/heads/main'    # Deploy only on main
```

### Performance Targets

| Stage | Target | Current |
|-------|--------|---------|
| Lint | <60s | ~30-45s ✅ |
| Test | <45s | ~20-30s ✅ |
| Build | <90s | ~45-60s ✅ |
| Integration | <45s | ~20-30s ✅ |
| **Total** | **<4min** | **~2-3min** ✅ |

---

## Best Practices

### 1. **Branch Strategy**

```yaml
branches: [main, develop]    # Protect these branches
```

- **main**: Production-ready code
- **develop**: Development code
- **feature/...**: Feature branches

### 2. **Require Status Checks**

Enforce pipeline passing before merge:
1. Settings → Branches
2. Select main/develop
3. Check "Require status checks to pass"
4. Select "CI Pipeline" job

### 3. **Code Review**

Workflow setup enforces:
```
[feature] → [PR] → [Pipeline] → [Review] → [Merge] → [Deploy]
```

### 4. **Commit Messages**

Good commit messages:
```
✅ Good:
feat: add user authentication
fix: resolve email validation bug
docs: update testing guide

❌ Bad:
fixed
updated
changes
```

### 5. **Keep Tests Fast**

- Unit tests: <30s
- Integration tests: <30s
- Build: <60s
- Total: <3 minutes

### 6. **Monitor Coverage**

```yaml
- uses: codecov/codecov-action@v3
  with:
    fail_ci_if_error: false    # Don't fail if codecov down
```

### 7. **Use Environments**

```yaml
environment:
  name: production
  url: https://qconnect.example.com
```

---

## Troubleshooting

### ESLint Failures

**Error**: `npm ERR! code ESLINTFAILURE`

**Solution**:
```bash
# Fix locally
npm run lint -- --fix

# Commit changes
git add .
git commit -m "style: fix linting issues"
```

### Test Failures

**Error**: `FAIL __tests__/api/users.test.ts`

**Solution**:
```bash
# Run locally
npm test -- users.test.ts --verbose

# Fix and commit
npm test -- --coverage
```

### Build Failures

**Error**: `ERROR: Build failed`

**Solution**:
```bash
# Rebuild locally
npm run build

# Check for TypeScript errors
npm run type-check

# Fix issues and commit
```

### Coverage Below Threshold

**Error**: `Coverage threshold not met: 80%`

**Solution**:
```bash
# View coverage report
npm test -- --coverage

# Write additional tests
# Increase coverage to 80%+
```

### Out of Disk Space

**Error**: `No space left on device`

**Solution**:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'    # Use caching to reduce space
```

### Secrets Not Found

**Error**: `secret is not defined`

**Solution**:
1. Check Settings → Secrets
2. Verify secret name matches workflow
3. Use defaults if optional:
   ```yaml
   env:
     AWS_REGION: ${{ secrets.AWS_REGION || 'us-east-1' }}
   ```

### Deployment Not Triggering

**Error**: Deploy step skipped

**Solution**:
```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

Check:
- ✅ Pushed to main branch
- ✅ Used git push (not PR merge)
- ✅ All previous jobs passed

---

## Deployment Integration

### AWS Deployment Example

```yaml
- name: Deploy to AWS
  run: |
    aws s3 sync .next s3://my-bucket/next \
      --region ${{ secrets.AWS_REGION }}
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Azure Deployment Example

```yaml
- name: Deploy to Azure
  uses: azure/webapps-deploy@v2
  with:
    app-name: 'qconnect-app'
    publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
```

### Vercel Deployment Example

```yaml
- name: Deploy to Vercel
  run: npx vercel deploy --prod
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## Monitoring & Alerts

### Slack Notifications

```yaml
- uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications

GitHub Actions sends by default:
- ✅ Workflow failures
- ✅ Deployment completion
- ✅ Status changes

**Configure in**: Settings → Notifications

---

## Key Takeaways

✅ **Automation**: Every push/PR validates automatically  
✅ **Quality**: Lint, test, and build checks enforce standards  
✅ **Safety**: Secrets protected, logs masked  
✅ **Speed**: Parallel jobs complete in ~2-3 minutes  
✅ **Visibility**: Detailed logs and summaries  
✅ **Reliability**: Deployment only after all checks pass  

---

## Next Steps

1. ✅ Review `.github/workflows/ci.yml`
2. ✅ Add repository secrets (Settings → Secrets)
3. ✅ Push code to trigger workflow
4. ✅ Monitor in Actions tab
5. ✅ Configure branch protection rules
6. ✅ Setup deployment credentials (AWS/Azure)
7. ✅ Enable notifications (Slack, email)

---

**Last Updated**: January 17, 2026  
**Status**: ✅ Complete  
**Next Phase**: Monitor and optimize pipeline based on usage
