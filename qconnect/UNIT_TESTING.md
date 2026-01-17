# Unit Testing Framework Setup Guide

**Date**: January 17, 2026  
**Sprint Week**: 1  
**Status**: Complete Implementation  
**Framework**: Jest + React Testing Library  

---

## Table of Contents

1. [Overview](#overview)
2. [Jest Configuration](#jest-configuration)
3. [React Testing Library Setup](#react-testing-library-setup)
4. [Test Structure & Best Practices](#test-structure--best-practices)
5. [Unit Test Examples](#unit-test-examples)
6. [Coverage Thresholds](#coverage-thresholds)
7. [Running Tests](#running-tests)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Unit Testing Matters

Unit testing provides:
- **Fast Feedback**: Tests run in milliseconds
- **Confidence**: Catch regressions early
- **Documentation**: Tests show how code should work
- **Refactoring Safety**: Change code without breaking functionality
- **Cost Reduction**: Fix bugs during development, not production

### Testing Pyramid

```
        ╱╲
       ╱  ╲  End-to-End Tests (Cypress, Playwright)
      ╱────╲ Few, slow, test entire flows
     ╱      ╲
    ╱────────╲ Integration Tests (RTL, MSW)
   ╱          ╲ Some, medium speed, test interactions
  ╱────────────╲ Unit Tests (Jest)
 ╱              ╲ Many, very fast, test individual functions
╱________________╲
```

### Test Types in QConnect

| Type | Scope | Tool | Count | Speed |
|------|-------|------|-------|-------|
| **Unit** | Functions, hooks, utilities | Jest | 60+ | <1ms each |
| **Component** | React components in isolation | RTL | 20+ | 10-50ms each |
| **Integration** | Multiple modules together | RTL + MSW | 10+ | 50-200ms each |
| **API** | API route handlers | Jest + Mocks | 15+ | 10-100ms each |
| **E2E** | Complete user workflows | Cypress | 5+ | 1-5s each |

---

## Jest Configuration

### Current Configuration (`jest.config.js`)

```javascript
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  // Setup files for test environment
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Use jsdom for DOM testing (browser-like environment)
  testEnvironment: 'jsdom',
  
  // Enable coverage collection
  collectCoverage: true,
  
  // Coverage sources (exclude test files)
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.test.{ts,tsx,js,jsx}',
    '!src/**/_*.{ts,tsx,js,jsx}',
    '!src/**/index.{ts,tsx,js,jsx}',
    '!src/**/types.{ts,tsx,js,jsx}',
  ],
  
  // Minimum coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,      // 80% of branches covered
      functions: 80,     // 80% of functions covered
      lines: 80,         // 80% of lines covered
      statements: 80,    // 80% of statements covered
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Coverage Thresholds Explained

- **Branches**: All if/else paths covered
- **Functions**: All functions called in tests
- **Lines**: All code lines executed
- **Statements**: All statements executed

**Target**: 80% is a good balance between coverage and test maintenance cost

### Customizing Configuration

**For different coverage by directory**:

```javascript
coverageThreshold: {
  global: { lines: 80 },
  './src/lib/': { lines: 95 },           // Critical utilities: high coverage
  './src/components/': { lines: 85 },    // Components: good coverage
  './src/utils/': { lines: 90 },         // Utils: high coverage
}
```

---

## React Testing Library Setup

### Setup File (`jest.setup.ts`)

```typescript
import '@testing-library/jest-dom';

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => 
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => 
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
```

### Available Matchers

**DOM Matchers** (from @testing-library/jest-dom):

```typescript
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveTextContent('text');
expect(element).toHaveClass('class-name');
expect(element).toHaveAttribute('attr', 'value');
expect(element).toBeDisabled();
expect(element).toHaveStyle('color: red');
expect(element).toHaveFormValues({ email: 'test@example.com' });
```

**Jest Built-in Matchers**:

```typescript
expect(value).toBe(expectedValue);              // Strict equality (===)
expect(value).toEqual(expectedValue);           // Deep equality
expect(value).toMatch(/regex/);                 // String match
expect(array).toContain(value);                 // Array contains
expect(fn).toHaveBeenCalled();                  // Mock called
expect(fn).toHaveBeenCalledWith(arg1, arg2);    // Mock called with args
expect(fn).toHaveBeenCalledTimes(2);            // Mock called N times
expect(promise).rejects.toThrow();              // Promise rejects
```

---

## Test Structure & Best Practices

### AAA Pattern (Arrange-Act-Assert)

```typescript
test('creates user successfully', async () => {
  // Arrange: Set up test data and mocks
  const mockUser = { name: 'John', email: 'john@example.com' };
  
  // Act: Execute the code being tested
  const result = await createUser(mockUser);
  
  // Assert: Verify the result
  expect(result).toEqual(mockUser);
});
```

### Test Structure

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {
      // test code
    });

    it('should throw error with invalid email', () => {
      // test code
    });

    it('should hash password before saving', () => {
      // test code
    });
  });

  describe('getUserById', () => {
    it('should return user by id', () => {
      // test code
    });

    it('should return null if user not found', () => {
      // test code
    });
  });
});
```

### Naming Convention

✅ **DO**:
- Use `describe()` for grouping related tests
- Use `test()` or `it()` for individual tests
- Name tests as sentences: "should do something when condition"
- Use descriptive names that explain what's being tested

❌ **DON'T**:
- Use vague names: "test1", "test_works"
- Put logic in test names
- Use abbreviations that aren't clear

### Mocking Best Practices

**1. Mock External Dependencies**:
```typescript
jest.mock('@/lib/prisma');
jest.mock('@/lib/email');

import { prisma } from '@/lib/prisma';
import { emailService } from '@/lib/email';

// Use mocks in tests
(prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
```

**2. Reset Mocks After Each Test**:
```typescript
afterEach(() => {
  jest.clearAllMocks();  // Clear mock calls
});
```

**3. Mock Specific Behavior**:
```typescript
// Success case
jest.mock('@/lib/fetch', () => ({
  fetch: jest.fn().mockResolvedValue({ ok: true, json: () => ({ id: 1 }) }),
}));

// Error case
jest.mock('@/lib/fetch', () => ({
  fetch: jest.fn().mockRejectedValue(new Error('Network error')),
}));
```

---

## Unit Test Examples

### Example 1: Testing a Utility Function

**File: `src/lib/sum.ts`**:
```typescript
export function sum(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}
```

**Test: `__tests__/sum.test.ts`**:
```typescript
import { sum, subtract } from '@/lib/sum';

describe('Math Utilities', () => {
  describe('sum', () => {
    it('should add two positive numbers', () => {
      expect(sum(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(sum(-2, -3)).toBe(-5);
    });

    it('should handle zero', () => {
      expect(sum(0, 5)).toBe(5);
    });

    it('should handle decimals', () => {
      expect(sum(1.5, 2.5)).toBeCloseTo(4);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });

    it('should handle negative result', () => {
      expect(subtract(3, 5)).toBe(-2);
    });
  });
});
```

### Example 2: Testing an API Route

**File: `app/api/appointments/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { doctorId, appointmentDate, userId } = await req.json();

    if (!doctorId || !appointmentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: { doctorId, appointmentDate, userId },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
```

**Test: `__tests__/api/appointments.test.ts`**:
```typescript
jest.mock('@/lib/prisma');

import { POST } from '@/app/api/appointments/route';
import { prisma } from '@/lib/prisma';

describe('POST /api/appointments', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create appointment with valid data', async () => {
    // Arrange
    const mockAppointment = {
      id: '1',
      doctorId: 'doc_123',
      appointmentDate: '2026-02-01',
      userId: 'user_123',
    };

    (prisma.appointment.create as jest.Mock).mockResolvedValue(mockAppointment);

    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        doctorId: 'doc_123',
        appointmentDate: '2026-02-01',
        userId: 'user_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe('1');
    expect(prisma.appointment.create).toHaveBeenCalledWith({
      data: {
        doctorId: 'doc_123',
        appointmentDate: '2026-02-01',
        userId: 'user_123',
      },
    });
  });

  it('should return 400 if required fields missing', async () => {
    // Arrange
    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ doctorId: 'doc_123' }), // Missing appointmentDate
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Missing required fields');
  });

  it('should return 500 on database error', async () => {
    // Arrange
    (prisma.appointment.create as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    const req = new Request('http://localhost/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        doctorId: 'doc_123',
        appointmentDate: '2026-02-01',
        userId: 'user_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Act
    const response = await POST(req);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('Failed to create appointment');
  });
});
```

### Example 3: Testing React Component

**File: `src/components/Button.tsx`**:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className="btn">
      {label}
    </button>
  );
}
```

**Test: `__tests__/components/Button.test.tsx`**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/Button';

describe('Button Component', () => {
  it('should render button with label', () => {
    render(<Button label="Click Me" onClick={jest.fn()} />);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button label="Click Me" onClick={jest.fn()} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} disabled />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have correct CSS class', () => {
    render(<Button label="Click Me" onClick={jest.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn');
  });
});
```

### Example 4: Testing with Async Operations

**File: `src/lib/userService.ts`**:
```typescript
export async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}
```

**Test: `__tests__/userService.test.ts`**:
```typescript
import { fetchUser } from '@/lib/userService';

describe('userService', () => {
  it('should fetch user successfully', async () => {
    // Mock global fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'John' }),
      })
    ) as jest.Mock;

    const user = await fetchUser('1');

    expect(user).toEqual({ id: '1', name: 'John' });
    expect(global.fetch).toHaveBeenCalledWith('/api/users/1');
  });

  it('should throw error on fetch failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false })
    ) as jest.Mock;

    await expect(fetchUser('1')).rejects.toThrow('Failed to fetch user');
  });
});
```

---

## Coverage Thresholds

### Understanding Coverage Metrics

**Line Coverage**: Percentage of code lines executed
```
✓ Total lines: 100
✓ Lines executed: 80
✓ Coverage: 80%
```

**Branch Coverage**: Percentage of if/else paths taken
```typescript
function getStatus(score: number) {
  if (score >= 80) {        // Branch 1
    return 'pass';
  } else {                  // Branch 2
    return 'fail';
  }
}

// To achieve 100% branch coverage, test both paths
test('pass with high score', () => expect(getStatus(90)).toBe('pass'));
test('fail with low score', () => expect(getStatus(50)).toBe('fail'));
```

**Function Coverage**: Percentage of functions called
```typescript
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

// If only add() is tested: 50% function coverage
test('add works', () => expect(add(2, 3)).toBe(5));
```

### Coverage Targets by Component Type

| Component | Target | Reasoning |
|-----------|--------|-----------|
| **Utilities** | 95%+ | Critical, core logic |
| **Services** | 90%+ | Business logic, error handling |
| **API Routes** | 85%+ | Happy path + error cases |
| **Components** | 80%+ | User interactions |
| **Helpers** | 80%+ | Nice to have, lower criticality |

### Improving Coverage

**Common Coverage Gaps**:

1. **Error Cases**:
```typescript
// ❌ Missing error test
async function saveData(data) {
  await database.save(data);
  return data;
}

// ✅ Add error case test
test('should throw on database error', async () => {
  jest.mock('database', () => ({
    save: jest.fn().mockRejectedValue(new Error('DB Error')),
  }));
  await expect(saveData({})).rejects.toThrow();
});
```

2. **Conditional Logic**:
```typescript
// ❌ Not testing both branches
if (user.isAdmin) {
  // ... code
}

// ✅ Test both branches
test('should perform admin action', () => { /* admin true */ });
test('should deny non-admin', () => { /* admin false */ });
```

3. **Edge Cases**:
```typescript
// ❌ Missing edge cases
function divide(a, b) {
  return a / b;
}

// ✅ Add edge case tests
test('divide positive numbers', () => expect(divide(10, 2)).toBe(5));
test('divide by negative', () => expect(divide(10, -2)).toBe(-5));
test('divide by decimal', () => expect(divide(10, 2.5)).toBe(4));
// Missing: zero division, negative numbers, etc.
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (rerun on file changes)
npm test -- --watch

# Run specific test file
npm test sum.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create"

# Generate coverage report
npm test -- --coverage

# Run with verbose output
npm test -- --verbose
```

### Coverage Report

```bash
npm test -- --coverage

# Output:
# ───────────────────────────────────────────────────
# File                | % Stmts | % Branch | % Funcs | % Lines
# ───────────────────────────────────────────────────
# All files           |   82.5  |   80.0   |   85.0  |   82.5
# src/lib/            |   90.0  |   88.0   |   95.0  |   90.0
# src/components/     |   75.0  |   70.0   |   80.0  |   75.0
# ───────────────────────────────────────────────────
```

### Coverage HTML Report

```bash
npm test -- --coverage

# View in browser (optional)
open coverage/lcov-report/index.html
```

---

## CI/CD Integration

### GitHub Actions Example

**File: `.github/workflows/test.yml`**:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Check coverage thresholds
        run: |
          COVERAGE=$(npm test -- --coverage --silent | grep "^All" | awk '{print $5}' | cut -d'.' -f1)
          if [ $COVERAGE -lt 80 ]; then
            echo "Coverage $COVERAGE% is below threshold of 80%"
            exit 1
          fi
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Build Failure on Low Coverage

Add to `package.json`:

```json
{
  "scripts": {
    "test:ci": "jest --coverage --ci",
    "test:coverage": "jest --coverage && node scripts/check-coverage.js"
  }
}
```

**File: `scripts/check-coverage.js`**:

```javascript
const fs = require('fs');

const coverage = JSON.parse(
  fs.readFileSync('./coverage/coverage-summary.json', 'utf8')
);

const thresholds = {
  lines: 80,
  statements: 80,
  functions: 80,
  branches: 80,
};

const global = coverage.total;
let failed = false;

Object.entries(thresholds).forEach(([metric, threshold]) => {
  if (global[metric].pct < threshold) {
    console.error(
      `❌ ${metric} coverage ${global[metric].pct}% < ${threshold}% threshold`
    );
    failed = true;
  } else {
    console.log(`✅ ${metric} coverage ${global[metric].pct}% >= ${threshold}%`);
  }
});

process.exit(failed ? 1 : 0);
```

---

## Troubleshooting

### Issue: Tests Not Running

**Solution 1**: Check jest.config.js is in root:
```bash
ls jest.config.js
# If not found, create it
npx jest --init
```

**Solution 2**: Clear Jest cache:
```bash
npm test -- --clearCache
```

### Issue: Module Not Found in Tests

**Solution**: Add moduleNameMapper to jest.config.js:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^@/components/(.*)$': '<rootDir>/src/components/$1',
  '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
}
```

### Issue: Cannot Find Module '@testing-library/react'

**Solution**: Install missing dependency:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Issue: Coverage Threshold Not Met

**Solution**: Write more tests or lower threshold (if justified):

```javascript
// Temporarily lower threshold to unblock CI
coverageThreshold: {
  global: {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75,
  },
}
```

Then gradually increase as coverage improves.

### Issue: Tests Timing Out

**Solution 1**: Increase timeout:
```typescript
jest.setTimeout(10000); // 10 seconds
```

**Solution 2**: Mock slow operations:
```typescript
jest.mock('@/lib/database', () => ({
  query: jest.fn().mockResolvedValue([]),
}));
```

---

## Next Steps

### Week 2: Expand Test Coverage

- [ ] Add tests for all utility functions (target: 95% coverage)
- [ ] Add component tests for UI components (target: 85% coverage)
- [ ] Add integration tests for API interactions
- [ ] Document test strategies in README

### Week 3: Test Quality

- [ ] Add snapshot tests for UI components
- [ ] Add visual regression tests
- [ ] Implement E2E tests with Cypress
- [ ] Review and optimize test performance

### Week 4: Continuous Testing

- [ ] Enable CI/CD test automation
- [ ] Monitor coverage trends
- [ ] Maintain >80% coverage throughout sprint
- [ ] Add test documentation to runbooks

---

## References

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-javascript)

---

**Document Version**: 1.0  
**Last Updated**: January 17, 2026  
**Sprint Week**: 1 (Week 1 Deliverable)
