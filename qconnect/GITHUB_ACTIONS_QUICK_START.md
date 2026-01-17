# GitHub Actions CI Pipeline - Quick Start Guide

**Status**: ✅ Ready to Use  
**Lesson**: Docker Build & Push Automation (GitHub Actions)  
**Score**: 4/5

---

## 🚀 Getting Started (5 minutes)

### 1. Push Code to Trigger Pipeline
```bash
# Create a feature branch
git checkout -b feature/my-change

# Make your changes
echo "// new feature" >> src/app/page.tsx

# Push to trigger pipeline
git push origin feature/my-change

# View results at:
# https://github.com/YOUR-ORG/YOUR-REPO/actions
```

### 2. Check Pipeline Status
1. **Open GitHub** → Your Repository
2. **Click Actions tab**
3. **Select "CI Pipeline"**
4. **Click the latest run**
5. **Watch it execute** (Lint → Test → Build → Deploy)

✅ **Green checkmark** = Success  
❌ **Red X** = Failure  
🟡 **Yellow circle** = In progress

---

## 📊 Pipeline Overview

```
Your Commit
    ↓
Lint 🔍
  - ESLint checks code style
  - TypeScript validates types
    ↓
Test ✅ (Parallel)        Build 🏗️ (Parallel)        Integration 🔗 (Parallel)
  - Jest runs tests         - Next.js compiles         - MSW tests APIs
  - Coverage checked        - Build output stored      - Optional, doesn't block
    ↓
Deploy 🚀 (Main branch only)
  - Ready for AWS/Azure
    ↓
Success ✅
```

**Total Time**: ~2-3 minutes (with caching)

---

## 🔧 Common Tasks

### Task 1: Fix a Failed Lint Error
**Error**: `npm ERR! code ESLINTFAILURE`

**Steps**:
```bash
# 1. Check the error in GitHub
# → Click on "Lint" job in Actions
# → Look for the error message

# 2. Fix locally
npm run lint -- --fix

# 3. Commit and push
git add .
git commit -m "style: fix linting errors"
git push origin feature/my-change

# 4. Pipeline re-runs automatically
```

---

### Task 2: Debug a Test Failure
**Error**: `FAIL src/lib/__tests__/mytest.test.ts`

**Steps**:
```bash
# 1. Run test locally
npm test -- mytest.test.ts

# 2. See the error and fix it
# 3. Verify fix works
npm test -- mytest.test.ts --watch

# 4. Push to trigger CI again
git push origin feature/my-change
```

---

### Task 3: Check Test Coverage
**Error**: `Coverage threshold not met: 80%`

**Steps**:
```bash
# 1. Run coverage locally
npm test -- --coverage

# 2. Open coverage report
# → Open `coverage/lcov-report/index.html` in browser

# 3. Write tests for uncovered lines
# 4. Re-run tests until coverage ≥ 80%
npm test -- --coverage
```

---

### Task 4: Debug Build Error
**Error**: `Next.js build failed`

**Steps**:
```bash
# 1. Build locally to reproduce
npm run build

# 2. Check the output for errors
# → Look for lines starting with "error"

# 3. Fix the issue
# 4. Verify build works
npm run build

# 5. Push to CI
git push origin feature/my-change
```

---

### Task 5: Deploy to Production
**Only happens automatically on main branch**

**Steps**:
```bash
# 1. Ensure all CI checks pass on feature branch
# → GitHub Actions shows all green

# 2. Get PR approved and merged to main
git checkout main
git pull origin main
git merge feature/my-change
git push origin main

# 3. Deploy stage runs automatically!
# → View in GitHub Actions → CI Pipeline
# → Deploys to production automatically
```

---

## 🔒 Adding Secrets (For Cloud Deployment)

### Add AWS Credentials
```bash
# In GitHub Repository Settings:
# Settings → Secrets and Variables → Actions

# Add these secrets:
1. Name: AWS_REGION          Value: us-east-1
2. Name: AWS_ACCESS_KEY_ID   Value: AKIA...
3. Name: AWS_SECRET_ACCESS_KEY Value: wJalr...
```

**Then** update `.github/workflows/ci.yml` Deploy step:
```yaml
- name: Deploy to AWS
  run: |
    aws s3 sync .next s3://my-bucket --region ${{ secrets.AWS_REGION }}
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## 📊 Understanding CI Results

### ✅ Successful Run
```
✓ Lint                passed    30s
✓ Test                passed    25s
✓ Build               passed    50s
✓ Integration Tests   passed    20s
✓ Deploy              passed    40s (main only)
✓ CI Status           passed    5s
```

**What to do**: Merge your PR! 🎉

---

### ❌ Failed Run (Example: Test Failure)
```
✓ Lint                passed    30s
✗ Test                failed    25s  ← Click here for error
  npm ERR! FAIL - UserService.test.ts line 45
  Expected true but got false

⊘ Build               skipped   (depends on test)
⊘ Integration Tests   skipped   (depends on lint)
⊘ Deploy              skipped   (depends on test)
⊘ CI Status           failed    (test failed)
```

**What to do**:
1. Click on the failed step
2. Read the error message
3. Fix locally: `npm test -- UserService.test.ts`
4. Push again: `git push origin feature/my-change`
5. CI re-runs automatically

---

## 📈 Monitoring Trends

### View Coverage History
```
GitHub → Actions → CI Pipeline → Coverage tab
  Shows coverage trend over time
  Target: 80%+ (currently ~82.5%)
```

### View All Pipeline Runs
```
GitHub → Actions → CI Pipeline
  Shows history of all runs
  Filter by branch or status
```

---

## 🚨 Troubleshooting

### Problem: "Cache not found"
**Cause**: First run on new branch  
**Solution**: Pipeline creates cache on first run, uses it after  
**Time**: First run ~3-4min, subsequent runs ~2min

---

### Problem: "Deployment failed"
**Cause**: Deploy step placeholder not configured  
**Solution**: Update `.github/workflows/ci.yml` Deploy step with:
- AWS ECS deployment, OR
- Azure App Service deployment, OR
- Custom deployment commands

---

### Problem: "Secret is not defined"
**Cause**: Secret doesn't exist or name mismatch  
**Solution**:
1. Check Settings → Secrets and Variables → Actions
2. Verify secret name matches workflow exactly
3. Add secret if missing

---

### Problem: "ESLint won't pass"
**Cause**: Formatting issues in code  
**Solution**: `npm run lint -- --fix` (auto-fixes most issues)

---

## 💡 Pro Tips

**Tip 1**: Always run tests locally before pushing
```bash
npm test -- --coverage
npm run lint
npm run build
```

**Tip 2**: Write meaningful commit messages
```
✅ Good: git commit -m "feat: add user authentication"
❌ Bad: git commit -m "update"
```

**Tip 3**: Use GitHub PR feature for code review
1. Create PR against `main`
2. Let CI check pass
3. Get approval
4. Merge automatically or manually

**Tip 4**: Watch the Actions tab while working
- Click "Re-run failed jobs" if transient error
- Doesn't require new commit

**Tip 5**: Check coverage locally
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

---

## 📚 Full Guides

- **Detailed Guide**: See [CI_CD_PIPELINE.md](CI_CD_PIPELINE.md)
- **README Section**: See [README.md#github-actions-ci-pipeline](README.md)
- **Implementation Details**: See [GITHUB_ACTIONS_CI_IMPLEMENTATION.md](GITHUB_ACTIONS_CI_IMPLEMENTATION.md)

---

## ✅ Checklist: Before Pushing Code

- [ ] Run tests locally: `npm test -- --coverage`
- [ ] Coverage ≥ 80%: Check output
- [ ] Lint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Commit message is clear: `git log --oneline -1`
- [ ] Branch name follows convention: `feature/...`, `fix/...`
- [ ] Ready to push: `git push origin feature/my-branch`

---

## 🎯 Next Steps

1. **Try it out**: Push a small change and watch CI run
2. **Add secrets**: Configure AWS/Azure credentials if deploying
3. **Set up branch protection**: Require CI to pass before merge
4. **Monitor coverage**: Keep tests above 80%
5. **Celebrate**: Every green check is code quality in action! 🎉

---

**Remember**: The CI pipeline is your invisible teammate — it reviews every commit and catches issues before they reach production.

Happy coding! 🚀
