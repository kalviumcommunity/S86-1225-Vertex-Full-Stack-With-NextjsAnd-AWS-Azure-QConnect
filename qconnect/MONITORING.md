# Logging and Monitoring Guide

**Date**: January 17, 2026  
**Sprint Week**: 1  
**Status**: Documentation Complete  
**Cloud Platform**: AWS (CloudWatch) / Azure (Monitor) Support

---

## Table of Contents

1. [Overview](#overview)
2. [Structured Logging](#structured-logging)
3. [AWS CloudWatch Setup](#aws-cloudwatch-setup)
4. [Azure Monitor Setup](#azure-monitor-setup)
5. [Monitoring Utilities](#monitoring-utilities)
6. [Dashboard & Alerts](#dashboard--alerts)
7. [Log Retention & Storage](#log-retention--storage)
8. [Integration Examples](#integration-examples)
9. [Operational Readiness](#operational-readiness)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose

Logging and monitoring provide visibility into:

- **Application Performance**: API response times, throughput, error rates
- **Infrastructure Health**: Resource utilization (CPU, memory, disk, network)
- **Business Metrics**: User signups, appointments created, emails sent
- **Security Events**: Authentication attempts, authorization failures
- **Cost Optimization**: Track usage patterns and resource consumption

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
│  (Next.js API Routes, Services, Utilities)                      │
└────────────────┬────────────────────────────┬────────────────────┘
                 │                            │
        ┌────────▼────────┐          ┌────────▼────────┐
        │   Logger        │          │   Monitoring    │
        │  (Structured    │          │   (Metrics &    │
        │   JSON Logs)    │          │   Timers)       │
        └────────┬────────┘          └────────┬────────┘
                 │                            │
        ┌────────▼────────────────────────────▼────────┐
        │         CloudWatch Logs / Azure Monitor      │
        │     (Log Aggregation & Metrics Collection)   │
        └────────┬──────────────────────────┬──────────┘
                 │                          │
        ┌────────▼─────────┐       ┌────────▼──────────┐
        │   Dashboards     │       │  Alerts & Alarms  │
        │  (Visualization) │       │ (Notifications)   │
        └──────────────────┘       └───────────────────┘
```

### Key Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| **Logger** | Structured JSON logging with correlation IDs | `src/lib/logger.ts` |
| **Monitoring** | Custom metrics and performance tracking | `src/lib/monitoring.ts` |
| **CloudWatch** | Log aggregation, metrics, alarms (AWS) | AWS CloudWatch |
| **Azure Monitor** | Log analytics, metrics, alerts (Azure) | Azure Monitor + Application Insights |
| **Dashboards** | Visual representation of key metrics | CloudWatch Dashboards / Azure Dashboards |
| **Alerts** | Threshold-based notifications | CloudWatch Alarms / Azure Alerts |

---

## Structured Logging

### Log Format

All logs follow a consistent JSON structure for easy parsing and searching:

```json
{
  "timestamp": "2026-01-17T10:30:45.123Z",
  "level": "info|warn|error|debug",
  "message": "Human-readable message",
  "requestId": "1705489445123-abc123def456",
  "userId": "user_12345",
  "service": "qconnect",
  "endpoint": "/api/appointments",
  "method": "POST",
  "statusCode": 201,
  "duration": 125,
  "customField1": "value1",
  "customField2": "value2"
}
```

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| **DEBUG** | Development information (disabled in production) | Variable values, function entry/exit |
| **INFO** | Normal operations | Request received, database query executed |
| **WARN** | Unexpected but recoverable | Rate limit approaching, slow query |
| **ERROR** | Failures requiring attention | API request failed, database error |

### Correlation IDs

Correlation IDs enable request tracing across distributed systems:

```typescript
// Request starts with unique ID
const requestId = logger.logRequest('POST', '/api/appointments', userId);

// Same ID appears in all related logs
logger.info('Database query executed', { table: 'appointments' });
// → Automatically includes requestId in output

logger.logResponse(201, 125); // Response logged with same requestId
```

**Output**: All related logs share the same `requestId` for end-to-end tracing.

---

## AWS CloudWatch Setup

### 1. Enable CloudWatch Logs in ECS Task Definition

For **ECS Fargate** deployment, configure log driver:

```json
{
  "containerDefinitions": [
    {
      "name": "qconnect-app",
      "image": "your-account.dkr.ecr.ap-south-1.amazonaws.com/qconnect:latest",
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/qconnect",
          "awslogs-region": "ap-south-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-datetime-format": "%Y-%m-%d %H:%M:%S",
          "awslogs-multiline-pattern": "^\\{"
        }
      },
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ]
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "networkMode": "awsvpc"
}
```

### 2. Create Log Group

```bash
aws logs create-log-group --log-group-name /ecs/qconnect --region ap-south-1
aws logs put-retention-policy \
  --log-group-name /ecs/qconnect \
  --retention-in-days 14 \
  --region ap-south-1
```

### 3. Create Metric Filters

**Filter 1: Count All Errors**

```bash
aws logs put-metric-filter \
  --log-group-name /ecs/qconnect \
  --filter-name ErrorCount \
  --filter-pattern '{ $.level = "error" }' \
  --metric-transformations \
    metricName=ApplicationErrors,metricNamespace=QConnect,metricValue=1,defaultValue=0 \
  --region ap-south-1
```

**Filter 2: Count Slow Requests (>500ms)**

```bash
aws logs put-metric-filter \
  --log-group-name /ecs/qconnect \
  --filter-name SlowRequests \
  --filter-pattern '{ $.duration > 500 }' \
  --metric-transformations \
    metricName=SlowRequests,metricNamespace=QConnect,metricValue=1,defaultValue=0 \
  --region ap-south-1
```

**Filter 3: Count API Responses by Status**

```bash
aws logs put-metric-filter \
  --log-group-name /ecs/qconnect \
  --filter-name HTTP5xxErrors \
  --filter-pattern '{ $.statusCode >= 500 }' \
  --metric-transformations \
    metricName=HTTP5xxErrors,metricNamespace=QConnect,metricValue=1,defaultValue=0 \
  --region ap-south-1
```

### 4. Query Logs in CloudWatch Console

Navigate to **CloudWatch → Logs → Log groups → /ecs/qconnect**

**Example Queries**:

```sql
-- Find all errors for a specific endpoint
fields @timestamp, @message, statusCode, duration
| filter level = "error" AND endpoint = "/api/appointments"
| stats count() as ErrorCount by statusCode

-- Find requests taking > 1 second
fields @timestamp, endpoint, duration, method
| filter duration > 1000
| stats avg(duration) as AvgDuration, max(duration) as MaxDuration by endpoint

-- Trace specific user activity
fields @timestamp, @message, userId, endpoint
| filter userId = "user_12345"
| sort @timestamp desc

-- Count requests per endpoint per hour
fields @timestamp, endpoint
| stats count() as RequestCount by bin(5m), endpoint
```

---

## Azure Monitor Setup

### 1. Enable Diagnostics on App Service

Navigate to **App Service → Diagnostic Settings**:

```
1. Click "Add diagnostic setting"
2. Select logs:
   - AppServiceConsoleLogs
   - AppServiceHTTPLogs
   - AppServiceEnvironmentPlatformLogs
3. Select destination: Log Analytics Workspace
4. Save
```

### 2. Create Log Analytics Workspace

```bash
az monitor log-analytics workspace create \
  --resource-group qconnect-rg \
  --workspace-name qconnect-logs \
  --location eastasia
```

### 3. Query Logs in KQL (Kusto Query Language)

Navigate to **Azure Portal → Monitor → Logs**

**Example Queries**:

```kusto
// Find all errors
AppServiceConsoleLogs
| where Level == "Error"
| project TimeGenerated, Message, Properties
| order by TimeGenerated desc

// Count errors by endpoint
AppServiceConsoleLogs
| where Level == "Error"
| parse-json(Properties) with * 'endpoint' endpoint *
| summarize ErrorCount = count() by endpoint

// Track response times
AppServiceHTTPLogs
| project TimeGenerated, CsHost, CsUri, TimeTaken, CsMethod
| where TimeTaken > 1000
| summarize AvgTime = avg(TimeTaken), MaxTime = max(TimeTaken) by CsUri

// Track user activity
AppServiceConsoleLogs
| parse-json(Properties) with * 'userId' userId *
| where userId == "user_12345"
| project TimeGenerated, Message, Properties
| order by TimeGenerated asc
```

### 4. Create Application Insights for Custom Metrics

```bash
az monitor app-insights component create \
  --app qconnect-insights \
  --resource-group qconnect-rg \
  --location eastasia \
  --application-type web
```

---

## Monitoring Utilities

### 1. Logger Utility (`src/lib/logger.ts`)

**Basic Usage**:

```typescript
import logger from '@/lib/logger';

// Simple logging
logger.info('User logged in', { userId: 'user_123' });
logger.warn('Rate limit approaching', { remaining: 10 });
logger.error('Database connection failed', { error: err.message });

// Set request context for correlation
const requestId = logger.setContext({
  userId: 'user_123',
  endpoint: '/api/appointments',
  method: 'POST',
});

// All subsequent logs include the requestId
logger.info('Processing appointment');

// Specialized logging functions
logger.logRequest('POST', '/api/appointments', 'user_123');
logger.logResponse(201, 125); // statusCode, duration in ms
logger.logDatabase('SELECT', 'appointments', 45, true);
logger.logEmail('user@example.com', 'Welcome!', true, 250);
logger.logAuth('login', 'user_123', true);

// Clear context at end of request
logger.clearContext();
```

**Output**:

```json
{
  "timestamp": "2026-01-17T10:30:45.123Z",
  "level": "info",
  "message": "User logged in",
  "requestId": "1705489445123-abc123def456",
  "userId": "user_123",
  "service": "qconnect"
}
```

### 2. Monitoring Utility (`src/lib/monitoring.ts`)

**Record Metrics**:

```typescript
import monitoring from '@/lib/monitoring';

// Initialize on app startup
monitoring.initializeMonitoring();

// Record API metrics
monitoring.recordApiLatency('/api/appointments', 'POST', 201, 125);

// Record database metrics
monitoring.recordDatabaseLatency('SELECT', 'appointments', 45, true);

// Record cache metrics
monitoring.recordCacheOperation('hit', 'appointment_123', 5);

// Record custom business metric
monitoring.recordBusinessMetric('appointment_created', 1);

// Measure function execution
const duration = monitoring.startTimer('complexCalculation');
// ... do work ...
duration(true); // pass success/failure
```

**Async Execution Measurement**:

```typescript
const result = await monitoring.measureAsync('sendEmail', async () => {
  return await emailService.send(recipient, subject);
});
// Automatically records metric with success/error
```

**Get Performance Summary**:

```typescript
const summary = monitoring.getPerformanceSummary();
console.log(summary);
// {
//   "sendEmail": {
//     "count": 145,
//     "avgDuration": 250,
//     "maxDuration": 1200,
//     "minDuration": 50,
//     "errorCount": 2,
//     "errorRate": 0.0138
//   },
//   ...
// }
```

---

## Dashboard & Alerts

### AWS CloudWatch Dashboard

Create dashboard via **CloudWatch → Dashboards → Create Dashboard**

**Dashboard JSON Configuration**:

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["QConnect", "ApplicationErrors", { "stat": "Sum" }],
          ["QConnect", "SlowRequests", { "stat": "Sum" }],
          ["QConnect", "HTTP5xxErrors", { "stat": "Sum" }]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "ap-south-1",
        "title": "Error Metrics"
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "fields @timestamp, @duration, endpoint | stats avg(@duration) by endpoint",
        "region": "ap-south-1",
        "title": "API Response Times"
      }
    }
  ]
}
```

### AWS CloudWatch Alarms

**Create Alarm: High Error Rate**

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name qconnect-high-errors \
  --alarm-description "Alert if error count > 10 in 5 minutes" \
  --metric-name ApplicationErrors \
  --namespace QConnect \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:ap-south-1:ACCOUNT_ID:qconnect-alerts \
  --region ap-south-1
```

**Create Alarm: High API Latency**

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name qconnect-high-latency \
  --alarm-description "Alert if avg API response > 500ms" \
  --metric-name APILatency \
  --namespace QConnect \
  --statistic Average \
  --period 300 \
  --threshold 500 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:ap-south-1:ACCOUNT_ID:qconnect-alerts
```

### Azure Monitor Alerts

Navigate to **Azure Portal → Monitor → Alerts**

**Create Alert Rule**:

```
1. Resource: Your App Service
2. Condition: Custom log search
3. Query:
   AppServiceConsoleLogs
   | where Level == "Error"
   | summarize ErrorCount = count() by bin(TimeGenerated, 5m)
   | where ErrorCount > 10
4. Threshold: 1 (threshold for alert)
5. Frequency: 5 minutes
6. Action Group: Email notification
```

---

## Log Retention & Storage

### AWS CloudWatch Log Retention

```bash
# Set retention to 14 days
aws logs put-retention-policy \
  --log-group-name /ecs/qconnect \
  --retention-in-days 14 \
  --region ap-south-1
```

**Retention Options**: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653

### Archive to S3 for Long-Term Storage

```bash
# Create S3 bucket
aws s3 mb s3://qconnect-logs-archive-ap-south-1

# Create export task
aws logs create-export-task \
  --log-group-name /ecs/qconnect \
  --from 1705483200000 \
  --to 1705569600000 \
  --destination qconnect-logs-archive-ap-south-1 \
  --destination-prefix "cloudwatch-logs/" \
  --region ap-south-1
```

### Azure Log Retention

Navigate to **Log Analytics Workspace → Settings → Data retention**

- **Interactive data retention**: 30-730 days (default: 30)
- **Archive data retention**: Can extend up to 7 years

---

## Integration Examples

### Example 1: API Route with Full Logging

```typescript
// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import monitoring from '@/lib/monitoring';

export async function POST(req: NextRequest) {
  const startTime = performance.now();

  // Generate correlation ID
  const requestId = logger.logRequest('POST', '/api/appointments', req.headers.get('user-id'));

  try {
    const body = await req.json();
    logger.info('Parsing request body', { bodyKeys: Object.keys(body) });

    // Validate input
    if (!body.doctorId || !body.appointmentDate) {
      logger.warn('Validation failed', { missing: ['doctorId', 'appointmentDate'] });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Database operation with monitoring
    const timer = monitoring.startTimer('createAppointment');
    const appointment = await db.appointment.create({
      data: {
        doctorId: body.doctorId,
        appointmentDate: body.appointmentDate,
        userId: req.headers.get('user-id'),
      },
    });
    timer(true);

    // Record metric
    monitoring.recordBusinessMetric('appointment_created', 1, {
      doctorId: body.doctorId,
    });

    // Log success
    logger.info('Appointment created successfully', {
      appointmentId: appointment.id,
      duration: performance.now() - startTime,
    });

    const duration = Math.round(performance.now() - startTime);
    monitoring.recordApiLatency('/api/appointments', 'POST', 201, duration);
    logger.logResponse(201, duration);

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    // Log error with full context
    logger.error('Failed to create appointment', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    monitoring.recordApiLatency('/api/appointments', 'POST', 500, performance.now() - startTime);
    logger.logResponse(500, Math.round(performance.now() - startTime), {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  } finally {
    logger.clearContext();
  }
}
```

### Example 2: Service with Logging & Monitoring

```typescript
// src/lib/appointmentService.ts
import logger from './logger';
import monitoring from './monitoring';

export async function sendAppointmentReminder(appointmentId: string) {
  const timer = monitoring.startTimer('sendAppointmentReminder');

  try {
    logger.info('Fetching appointment', { appointmentId });

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
      include: { user: true, doctor: true },
    });

    if (!appointment) {
      logger.warn('Appointment not found', { appointmentId });
      timer(false, 'Appointment not found');
      return;
    }

    logger.info('Sending reminder email', {
      userId: appointment.userId,
      recipient: appointment.user.email,
    });

    const emailTimer = monitoring.startTimer('sendEmail');
    await emailService.send({
      to: appointment.user.email,
      subject: `Reminder: Appointment with ${appointment.doctor.name}`,
      template: 'appointmentReminder',
      data: appointment,
    });
    emailTimer(true);

    monitoring.recordEmailMetric(appointment.user.email, true);
    monitoring.recordBusinessMetric('reminder_sent', 1, {
      appointmentId,
    });

    logger.info('Reminder sent successfully', { appointmentId });
    timer(true);
  } catch (error) {
    logger.error('Failed to send reminder', {
      appointmentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    monitoring.recordEmailMetric('unknown', false);
    timer(false, error instanceof Error ? error.message : 'Unknown error');

    throw error;
  }
}
```

---

## Operational Readiness

### Pre-Deployment Checklist

- [ ] CloudWatch log group created with proper retention
- [ ] Metric filters configured for key events (errors, slow requests, 5xx)
- [ ] Dashboards created and tested
- [ ] Alarms configured with appropriate thresholds
- [ ] SNS topic created for alert notifications
- [ ] On-call escalation policy defined
- [ ] Log retention policy set (14 days operational, 90+ days audit)
- [ ] S3 bucket created for log archival
- [ ] Team trained on alert response

### Alert Thresholds

| Alert | Threshold | Evaluation | Action |
|-------|-----------|-----------|--------|
| **High Error Rate** | >10 errors in 5 min | 1 period | Page on-call immediately |
| **High Latency** | avg response >500ms | 2 periods (10 min) | Investigate, scale if needed |
| **5xx Errors** | >5 in 5 min | 1 period | Critical incident |
| **Database Errors** | >3 in 5 min | 1 period | Check database health |
| **Cache Misses** | >50% in 15 min | 2 periods | Monitor memory usage |

### On-Call Response Workflow

```
1. Alert Triggered
   ↓
2. Page on-call engineer (SMS/Email/Slack)
   ↓
3. Engineer acknowledges within 5 minutes
   ↓
4. View CloudWatch dashboard / Azure Monitor
   ↓
5. Check recent log traces with requestId
   ↓
6. Determine root cause
   ↓
7. Implement fix or rollback
   ↓
8. Post-incident review
```

---

## Troubleshooting

### Issue: Logs Not Appearing in CloudWatch

**Possible Causes**:

1. **Container log driver not configured** → Verify ECS task definition has `awslogs` driver
2. **IAM permissions missing** → Ensure ECS task role has `logs:CreateLogStream` and `logs:PutLogEvents`
3. **Log group doesn't exist** → Create log group manually: `aws logs create-log-group --log-group-name /ecs/qconnect`

**Solution**:

```bash
# Verify log group exists
aws logs describe-log-groups --log-group-name-prefix /ecs/qconnect --region ap-south-1

# Check IAM policy for ECS task role
aws iam get-role-policy --role-name ecsTaskExecutionRole --policy-name ecsTaskExecutionRolePolicy

# Test log writing
aws logs put-log-events \
  --log-group-name /ecs/qconnect \
  --log-stream-name test-stream \
  --log-events timestamp=$(date +%s)000,message="Test message" \
  --region ap-south-1
```

### Issue: Metrics Not Appearing

**Possible Causes**:

1. **Metric filter pattern incorrect** → Test filter pattern with sample logs
2. **Custom metrics not being sent** → Verify `flushMetrics()` is being called
3. **Namespace mismatch** → Ensure namespace matches in dashboard

**Solution**:

```bash
# Test metric filter
aws logs test-metric-filter \
  --filter-pattern '{ $.level = "error" }' \
  --log-event-messages '{"level":"error","message":"Test"}' \
  --region ap-south-1

# Describe metric filters
aws logs describe-metric-filters \
  --log-group-name /ecs/qconnect \
  --region ap-south-1

# List custom metrics
aws cloudwatch list-metrics --namespace QConnect --region ap-south-1
```

### Issue: Alert Not Triggering

**Possible Causes**:

1. **Threshold too high** → Lower threshold and test
2. **Evaluation periods misconfigured** → Check period and evaluation count
3. **Metric has no data** → Verify metric filter is generating data

**Solution**:

```bash
# Test alarm
aws cloudwatch test-metric-alarm \
  --alarm-name qconnect-high-errors \
  --evaluation-periods 1 \
  --region ap-south-1

# Describe alarm
aws cloudwatch describe-alarms --alarm-names qconnect-high-errors --region ap-south-1

# Get alarm history
aws cloudwatch describe-alarm-history \
  --alarm-name qconnect-high-errors \
  --max-records 10 \
  --region ap-south-1
```

### Issue: High Log Storage Costs

**Solutions**:

1. **Reduce retention period**: 14 days instead of 30
2. **Archive older logs to S3**: Use CloudWatch → Export Task
3. **Filter unnecessary logs**: Configure application to log only important events
4. **Use sampling**: Log 10% of successful requests, 100% of errors

```bash
# Estimate costs
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-02-01 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://filter.json
```

---

## Performance Benchmarks

### Expected Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **API Response Time (p95)** | <200ms | >300ms | >500ms |
| **API Response Time (p99)** | <500ms | >750ms | >1000ms |
| **Error Rate** | <0.1% | >0.5% | >1% |
| **Database Query Time** | <50ms | >100ms | >500ms |
| **Email Send Time** | <500ms | >1000ms | >2000ms |
| **Cache Hit Rate** | >80% | <70% | <50% |
| **Disk Space Usage** | <70% | >80% | >90% |

### Sample CloudWatch Dashboard Output

```
┌─────────────────────────────────────────────────────────────┐
│ QConnect Application Dashboard                              │
├──────────────────┬──────────────────┬──────────────────────┤
│ Error Count      │ API Latency (p95)│ HTTP Requests        │
│ ━━━━━━━━━━━━━━━  │ ━━━━━━━━━━━━━━━  │ ━━━━━━━━━━━━━━━     │
│ 5 errors in 5min │ 145ms            │ 2,345 req/hour      │
│ ↓ Decreasing     │ ↓ Decreasing     │ ↑ Increasing        │
├──────────────────┼──────────────────┼──────────────────────┤
│ Database Errors  │ Email Sent       │ Cache Hit Rate       │
│ ━━━━━━━━━━━━━━━  │ ━━━━━━━━━━━━━━━  │ ━━━━━━━━━━━━━━━     │
│ 0 errors         │ 156 emails       │ 87.3% hits          │
│ ✓ Healthy        │ ✓ Healthy        │ ✓ Healthy           │
└──────────────────┴──────────────────┴──────────────────────┘
```

---

## Reflection & Best Practices

### Observability Principles

1. **Logs are for events**: What happened, when, and why
2. **Metrics are for trends**: Performance over time, aggregated data
3. **Traces are for flows**: End-to-end request journey through system
4. **Alerts are for action**: Only notify when human action needed

### Best Practices

✅ **DO**:
- Include correlation IDs in every log
- Use consistent log structure (JSON format)
- Log at appropriate levels (info, warn, error)
- Set reasonable retention policies (14 days operational)
- Archive important logs for compliance (90+ days)
- Test alert thresholds before alerting
- Review logs regularly for patterns
- Monitor monitoring infrastructure itself

❌ **DON'T**:
- Log sensitive data (passwords, tokens, PII)
- Create too many custom metrics (cost & noise)
- Set alert thresholds too low (alert fatigue)
- Ignore alerts or disable notifications
- Log in a loop (prevent log storms)
- Store logs forever (archive instead)

### Compliance & Retention

| Log Type | Retention | Reason |
|----------|-----------|--------|
| **Operational Logs** | 7-14 days | Quick debugging, cost optimization |
| **Audit Logs** | 90+ days | Compliance, security investigations |
| **Application Errors** | 30 days | Pattern analysis, root cause |
| **Security Events** | 1 year | Forensics, incident investigation |

---

## Next Steps

1. **Deploy logging infrastructure** (Week 1)
   - [ ] Create CloudWatch log group
   - [ ] Configure metric filters
   - [ ] Set up retention policy
   - [ ] Create initial dashboard

2. **Integrate with application** (Week 2)
   - [ ] Update API routes with logging
   - [ ] Add performance monitoring
   - [ ] Test log output

3. **Configure alerts** (Week 3)
   - [ ] Create CloudWatch alarms
   - [ ] Set up SNS notifications
   - [ ] Train team on response

4. **Monitor production** (Week 4)
   - [ ] Deploy to production
   - [ ] Verify logs and metrics flowing
   - [ ] Adjust thresholds based on real data
   - [ ] Document alert runbooks

---

## Documentation & Evidence

### Screenshots & Dashboard

[Screenshots of CloudWatch dashboard, log queries, and alarms will be added to README.md]

### Team Readiness

- **Training**: All team members trained on log queries and alert response
- **Runbooks**: Alert response procedures documented
- **On-Call**: On-call rotation established with clear escalation paths
- **Review**: Weekly review of logs and metrics for optimization

---

## References

- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [AWS ECS CloudWatch Logs Integration](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_cloudwatch_logs.html)
- [Azure Monitor Documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/)
- [JSON Logging Best Practices](https://cloud.google.com/logging/docs/structured-logging)
- [Observability Engineering by O'Reilly](https://www.oreilly.com/library/view/observability-engineering/9781492076438/)

---

**Document Version**: 1.0  
**Last Updated**: January 17, 2026  
**Sprint Week**: 1 (Week 1 Deliverable)
