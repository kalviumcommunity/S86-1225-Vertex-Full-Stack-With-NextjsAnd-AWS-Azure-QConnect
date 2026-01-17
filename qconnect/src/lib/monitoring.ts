/**
 * Monitoring and Metrics Utility
 * Tracks custom metrics for CloudWatch and Azure Monitor
 * Provides performance monitoring, error tracking, and business metrics
 */

import logger from './logger';

interface MetricData {
  name: string;
  value: number;
  unit: 'Count' | 'Seconds' | 'Percent' | 'Bytes' | 'None';
  timestamp: Date;
  dimensions?: Record<string, string>;
}

interface PerformanceMetric {
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  error?: string;
}

// In-memory metric buffer (in production, batch to CloudWatch)
const metricsBuffer: MetricData[] = [];
const performanceMetrics: PerformanceMetric[] = [];

const METRICS_BUFFER_SIZE = 100;
const FLUSH_INTERVAL = 60000; // 1 minute

/**
 * Initialize monitoring - start background flush interval
 */
export function initializeMonitoring() {
  setInterval(() => {
    if (metricsBuffer.length > 0) {
      flushMetrics();
    }
  }, FLUSH_INTERVAL);

  logger.info('Monitoring initialized', {
    bufferSize: METRICS_BUFFER_SIZE,
    flushInterval: FLUSH_INTERVAL,
  });
}

/**
 * Record a custom metric
 */
export function recordMetric(
  name: string,
  value: number,
  unit: 'Count' | 'Seconds' | 'Percent' | 'Bytes' | 'None' = 'None',
  dimensions?: Record<string, string>
) {
  const metric: MetricData = {
    name,
    value,
    unit,
    timestamp: new Date(),
    dimensions,
  };

  metricsBuffer.push(metric);

  // Auto-flush if buffer is full
  if (metricsBuffer.length >= METRICS_BUFFER_SIZE) {
    flushMetrics();
  }

  logger.debug('Metric recorded', { name, value, unit });
}

/**
 * Record API endpoint latency
 */
export function recordApiLatency(
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
) {
  recordMetric(`api.${method}.${endpoint}.latency`, duration, 'Seconds', {
    endpoint,
    method,
    statusCode: statusCode.toString(),
  });

  // Also record as a count for total requests
  recordMetric(`api.requests.total`, 1, 'Count', {
    endpoint,
    method,
    statusCode: statusCode.toString(),
  });

  // Count errors separately
  if (statusCode >= 400) {
    recordMetric(`api.errors.${statusCode}`, 1, 'Count', {
      endpoint,
      method,
    });
  }
}

/**
 * Record database operation latency
 */
export function recordDatabaseLatency(
  operation: string,
  table: string,
  duration: number,
  success: boolean
) {
  recordMetric(`db.${operation}.${table}.latency`, duration, 'Seconds', {
    operation,
    table,
    status: success ? 'success' : 'failure',
  });

  if (!success) {
    recordMetric(`db.${operation}.errors`, 1, 'Count', { table });
  }
}

/**
 * Record cache operation
 */
export function recordCacheOperation(
  operation: 'hit' | 'miss' | 'set' | 'delete',
  key: string,
  duration?: number
) {
  recordMetric(`cache.${operation}`, 1, 'Count', {
    operation,
    key: key.substring(0, 50), // Limit key length for dimension
  });

  if (duration) {
    recordMetric(`cache.${operation}.latency`, duration, 'Seconds', {
      operation,
    });
  }
}

/**
 * Record email operation
 */
export function recordEmailMetric(
  recipient: string,
  success: boolean,
  duration?: number
) {
  const status = success ? 'sent' : 'failed';
  recordMetric(`email.${status}`, 1, 'Count', {
    status,
  });

  if (duration) {
    recordMetric(`email.latency`, duration, 'Seconds', {
      status,
    });
  }
}

/**
 * Record authentication event
 */
export function recordAuthMetric(
  event: 'login' | 'logout' | 'signup' | 'mfa_success' | 'mfa_failed',
  success: boolean
) {
  recordMetric(`auth.${event}`, 1, 'Count', {
    event,
    status: success ? 'success' : 'failure',
  });

  if (!success) {
    recordMetric(`auth.failures`, 1, 'Count', { event });
  }
}

/**
 * Record business event
 */
export function recordBusinessMetric(
  eventName: string,
  value: number = 1,
  meta?: Record<string, string>
) {
  recordMetric(`business.${eventName}`, value, 'Count', meta);
}

/**
 * Track performance of an operation
 */
export function startTimer(operationName: string): () => void {
  const startTime = performance.now();

  return (success: boolean = true, error?: string) => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    performanceMetrics.push({
      operationName,
      startTime,
      endTime,
      duration,
      success,
      error,
    });

    recordMetric(`operation.${operationName}.duration`, duration, 'Seconds', {
      status: success ? 'success' : 'failure',
    });

    logger.logPerformance(operationName, duration, {
      success,
      ...(error && { error }),
    });

    return duration;
  };
}

/**
 * Measure function execution time and record metric
 */
export async function measureAsync<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const timer = startTimer(operationName);
  try {
    const result = await fn();
    timer(true);
    return result;
  } catch (err) {
    timer(false, err instanceof Error ? err.message : 'Unknown error');
    throw err;
  }
}

/**
 * Measure synchronous function execution time
 */
export function measureSync<T>(
  operationName: string,
  fn: () => T
): T {
  const timer = startTimer(operationName);
  try {
    const result = fn();
    timer(true);
    return result;
  } catch (err) {
    timer(false, err instanceof Error ? err.message : 'Unknown error');
    throw err;
  }
}

/**
 * Flush metrics to CloudWatch (mock implementation)
 * In production, integrate with AWS SDK or Azure SDK
 */
export async function flushMetrics(): Promise<void> {
  if (metricsBuffer.length === 0) {
    return;
  }

  try {
    // Mock: In production, batch send to CloudWatch or Azure Monitor
    const metricsToFlush = metricsBuffer.splice(0, METRICS_BUFFER_SIZE);

    logger.info('Flushing metrics to CloudWatch', {
      count: metricsToFlush.length,
      metrics: metricsToFlush.map((m) => ({
        name: m.name,
        value: m.value,
        unit: m.unit,
      })),
    });

    // TODO: Integrate with AWS CloudWatch SDK
    // const cloudwatch = new CloudWatch({ region: process.env.AWS_REGION });
    // await cloudwatch.putMetricData({
    //   Namespace: 'QConnect',
    //   MetricData: metricsToFlush.map(metric => ({
    //     MetricName: metric.name,
    //     Value: metric.value,
    //     Unit: metric.unit,
    //     Timestamp: metric.timestamp,
    //     Dimensions: Object.entries(metric.dimensions || {}).map(([k, v]) => ({
    //       Name: k,
    //       Value: v,
    //     })),
    //   })),
    // }).promise();
  } catch (err) {
    logger.error('Failed to flush metrics', {
      error: err instanceof Error ? err.message : 'Unknown error',
      count: metricsBuffer.length,
    });
  }
}

/**
 * Get performance metrics summary
 */
export function getPerformanceSummary() {
  const summary: Record<
    string,
    {
      count: number;
      avgDuration: number;
      maxDuration: number;
      minDuration: number;
      errorCount: number;
      errorRate: number;
    }
  > = {};

  for (const metric of performanceMetrics) {
    if (!summary[metric.operationName]) {
      summary[metric.operationName] = {
        count: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
        errorCount: 0,
        errorRate: 0,
      };
    }

    const stats = summary[metric.operationName];
    stats.count++;

    if (metric.duration) {
      stats.avgDuration = (stats.avgDuration * (stats.count - 1) + metric.duration) / stats.count;
      stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
      stats.minDuration = Math.min(stats.minDuration, metric.duration);
    }

    if (!metric.success) {
      stats.errorCount++;
    }

    stats.errorRate = stats.errorCount / stats.count;
  }

  return summary;
}

/**
 * Clear performance metrics (call after exporting summary)
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.length = 0;
}

/**
 * Get current metrics buffer
 */
export function getMetricsBuffer(): MetricData[] {
  return [...metricsBuffer];
}

/**
 * Get metrics count
 */
export function getMetricsCount(): number {
  return metricsBuffer.length;
}

export const monitoring = {
  initializeMonitoring,
  recordMetric,
  recordApiLatency,
  recordDatabaseLatency,
  recordCacheOperation,
  recordEmailMetric,
  recordAuthMetric,
  recordBusinessMetric,
  startTimer,
  measureAsync,
  measureSync,
  flushMetrics,
  getPerformanceSummary,
  clearPerformanceMetrics,
  getMetricsBuffer,
  getMetricsCount,
};

export default monitoring;
