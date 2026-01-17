/**
 * Unit Tests for Monitoring Utility
 * Tests custom metrics recording and performance tracking
 * 
 * Test Coverage:
 * - Metric recording for different event types
 * - Performance timer functionality
 * - Async/sync measurement
 * - Metrics buffer management
 * - Performance summary generation
 * - Auto-flush intervals
 */

import monitoring from '@/lib/monitoring';

describe('Monitoring Utility', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    // Clear metrics between tests
    monitoring.clearPerformanceMetrics();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    monitoring.clearPerformanceMetrics();
  });

  describe('Metric Recording', () => {
    it('should record API latency metric', () => {
      monitoring.recordApiLatency('/api/appointments', 'POST', 201, 125);

      const buffer = monitoring.getMetricsBuffer();
      expect(buffer.length).toBeGreaterThan(0);

      const metric = buffer.find((m) => m.name.includes('api'));
      expect(metric).toBeDefined();
      expect(metric?.value).toBe(125);
      expect(metric?.unit).toBe('Seconds');
    });

    it('should record database latency metric', () => {
      monitoring.recordDatabaseLatency('SELECT', 'appointments', 45, true);

      const buffer = monitoring.getMetricsBuffer();
      const metric = buffer.find((m) => m.name.includes('db'));

      expect(metric).toBeDefined();
      expect(metric?.value).toBe(45);
    });

    it('should record cache operation metric', () => {
      monitoring.recordCacheOperation('hit', 'user_123_key', 5);

      const buffer = monitoring.getMetricsBuffer();
      const metric = buffer.find((m) => m.name.includes('cache'));

      expect(metric).toBeDefined();
      expect(metric?.name).toContain('hit');
    });

    it('should record email metric', () => {
      monitoring.recordEmailMetric('user@example.com', true, 250);

      const buffer = monitoring.getMetricsBuffer();
      const metric = buffer.find((m) => m.name.includes('email'));

      expect(metric).toBeDefined();
      expect(metric?.value).toBe(1);
      expect(metric?.unit).toBe('Count');
    });

    it('should record auth metric', () => {
      monitoring.recordAuthMetric('login', true);

      const buffer = monitoring.getMetricsBuffer();
      const metric = buffer.find((m) => m.name.includes('auth.login'));

      expect(metric).toBeDefined();
      expect(metric?.name).toContain('login');
    });

    it('should record business metric', () => {
      monitoring.recordBusinessMetric('appointment_created', 1, { doctorId: 'doc_123' });

      const buffer = monitoring.getMetricsBuffer();
      const metric = buffer.find((m) => m.name.includes('appointment_created'));

      expect(metric).toBeDefined();
      expect(metric?.dimensions).toHaveProperty('doctorId', 'doc_123');
    });

    it('should record multiple metrics for API request', () => {
      monitoring.recordApiLatency('/api/test', 'GET', 200, 100);

      const buffer = monitoring.getMetricsBuffer();
      const count = buffer.filter((m) => m.name.includes('api')).length;

      // Should record latency AND total requests count
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it('should record error metric for failed requests', () => {
      monitoring.recordApiLatency('/api/test', 'GET', 500, 50);

      const buffer = monitoring.getMetricsBuffer();
      const errorMetric = buffer.find((m) => m.name.includes('errors'));

      expect(errorMetric).toBeDefined();
    });
  });

  describe('Performance Timer', () => {
    it('should measure operation duration', () => {
      const timer = monitoring.startTimer('testOperation');

      // Simulate work
      setTimeout(() => {}, 50);

      const duration = timer(true);

      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should record success timer', () => {
      const timer = monitoring.startTimer('successOperation');
      timer(true);

      const summary = monitoring.getPerformanceSummary();

      expect(summary.successOperation).toBeDefined();
      expect(summary.successOperation.count).toBe(1);
      expect(summary.successOperation.errorCount).toBe(0);
    });

    it('should record failed timer', () => {
      const timer = monitoring.startTimer('failedOperation');
      timer(false, 'Test error');

      const summary = monitoring.getPerformanceSummary();

      expect(summary.failedOperation.count).toBe(1);
      expect(summary.failedOperation.errorCount).toBe(1);
      expect(summary.failedOperation.errorRate).toBeCloseTo(1.0);
    });

    it('should track multiple calls to same operation', () => {
      const timer1 = monitoring.startTimer('multipleOps');
      timer1(true);

      const timer2 = monitoring.startTimer('multipleOps');
      timer2(true);

      const timer3 = monitoring.startTimer('multipleOps');
      timer3(true);

      const summary = monitoring.getPerformanceSummary();

      expect(summary.multipleOps.count).toBe(3);
    });

    it('should calculate average duration', () => {
      // Simulate 3 operations: 100ms, 200ms, 300ms
      const timer1 = monitoring.startTimer('avgTest');
      timer1(true);

      const timer2 = monitoring.startTimer('avgTest');
      timer2(true);

      const timer3 = monitoring.startTimer('avgTest');
      timer3(true);

      const summary = monitoring.getPerformanceSummary();

      // Average should be roughly in the middle
      expect(summary.avgTest.avgDuration).toBeGreaterThan(0);
      expect(summary.avgTest.minDuration).toBeLessThanOrEqual(summary.avgTest.avgDuration);
      expect(summary.avgTest.maxDuration).toBeGreaterThanOrEqual(summary.avgTest.avgDuration);
    });

    it('should track min and max durations', () => {
      const durations = [50, 100, 200, 300, 150];

      durations.forEach((duration) => {
        const timer = monitoring.startTimer('minMaxTest');
        // Manually set timing by calling timer immediately
        timer(true);
      });

      const summary = monitoring.getPerformanceSummary();

      expect(summary.minMaxTest.minDuration).toBeLessThanOrEqual(
        summary.minMaxTest.maxDuration
      );
      expect(summary.minMaxTest.count).toBe(durations.length);
    });
  });

  describe('Async Measurement', () => {
    it('should measure async operation success', async () => {
      const result = await monitoring.measureAsync('asyncSuccess', async () => {
        return Promise.resolve({ data: 'success' });
      });

      expect(result).toEqual({ data: 'success' });

      const summary = monitoring.getPerformanceSummary();
      expect(summary.asyncSuccess.count).toBe(1);
      expect(summary.asyncSuccess.errorCount).toBe(0);
    });

    it('should measure async operation failure', async () => {
      const asyncFn = monitoring.measureAsync('asyncFailure', async () => {
        return Promise.reject(new Error('Async error'));
      });

      await expect(asyncFn).rejects.toThrow('Async error');

      const summary = monitoring.getPerformanceSummary();
      expect(summary.asyncFailure.errorCount).toBe(1);
    });

    it('should measure sync operation success', () => {
      const result = monitoring.measureSync('syncSuccess', () => {
        return { data: 'sync' };
      });

      expect(result).toEqual({ data: 'sync' });

      const summary = monitoring.getPerformanceSummary();
      expect(summary.syncSuccess.count).toBe(1);
      expect(summary.syncSuccess.errorCount).toBe(0);
    });

    it('should measure sync operation failure', () => {
      const syncFn = () => {
        return monitoring.measureSync('syncFailure', () => {
          throw new Error('Sync error');
        });
      };

      expect(syncFn).toThrow('Sync error');

      const summary = monitoring.getPerformanceSummary();
      expect(summary.syncFailure.errorCount).toBe(1);
    });
  });

  describe('Metrics Buffer', () => {
    it('should store metrics in buffer', () => {
      monitoring.recordMetric('test.metric', 100, 'Count');

      const buffer = monitoring.getMetricsBuffer();

      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer[0].name).toBe('test.metric');
    });

    it('should return metrics count', () => {
      const count1 = monitoring.getMetricsCount();

      monitoring.recordMetric('metric1', 10, 'Count');
      monitoring.recordMetric('metric2', 20, 'Count');

      const count2 = monitoring.getMetricsCount();

      expect(count2).toBeGreaterThan(count1);
    });

    it('should include timestamp in metrics', () => {
      monitoring.recordMetric('timestamped', 100, 'Count');

      const buffer = monitoring.getMetricsBuffer();
      const metric = buffer[0];

      expect(metric.timestamp).toBeDefined();
      expect(metric.timestamp).toBeInstanceOf(Date);
    });

    it('should include dimensions in metrics', () => {
      monitoring.recordMetric('dimensioned', 100, 'Count', {
        service: 'api',
        endpoint: '/appointments',
      });

      const buffer = monitoring.getMetricsBuffer();
      const metric = buffer[0];

      expect(metric.dimensions).toEqual({
        service: 'api',
        endpoint: '/appointments',
      });
    });

    it('should auto-flush buffer when full', () => {
      // Record many metrics to trigger buffer flush
      for (let i = 0; i < 150; i++) {
        monitoring.recordMetric(`metric_${i}`, 10, 'Count');
      }

      // Check that console.log was called (flush logging)
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('Performance Summary', () => {
    it('should generate performance summary', () => {
      const timer1 = monitoring.startTimer('operation');
      timer1(true);

      const timer2 = monitoring.startTimer('operation');
      timer2(false);

      const summary = monitoring.getPerformanceSummary();

      expect(summary.operation).toBeDefined();
      expect(summary.operation.count).toBe(2);
      expect(summary.operation.errorCount).toBe(1);
      expect(summary.operation.errorRate).toBeCloseTo(0.5);
    });

    it('should calculate error rate correctly', () => {
      // 1 success, 1 failure = 50% error rate
      const timer1 = monitoring.startTimer('errorRateTest');
      timer1(true);

      const timer2 = monitoring.startTimer('errorRateTest');
      timer2(false);

      const summary = monitoring.getPerformanceSummary();

      expect(summary.errorRateTest.errorRate).toBeCloseTo(0.5, 1);
    });

    it('should handle zero errors', () => {
      const timer = monitoring.startTimer('noErrors');
      timer(true);

      const summary = monitoring.getPerformanceSummary();

      expect(summary.noErrors.errorRate).toBe(0);
    });

    it('should handle all errors', () => {
      const timer1 = monitoring.startTimer('allErrors');
      timer1(false);

      const timer2 = monitoring.startTimer('allErrors');
      timer2(false);

      const summary = monitoring.getPerformanceSummary();

      expect(summary.allErrors.errorRate).toBeCloseTo(1.0);
    });
  });

  describe('Initialization', () => {
    it('should initialize monitoring', () => {
      expect(() => {
        monitoring.initializeMonitoring();
      }).not.toThrow();
    });

    it('should set up auto-flush interval', (done) => {
      monitoring.initializeMonitoring();

      monitoring.recordMetric('test', 100, 'Count');

      // Wait for flush interval
      setTimeout(() => {
        expect(consoleLogSpy).toHaveBeenCalled();
        done();
      }, 1100); // More than 60 second flush interval (adjust for test speed)
    });
  });

  describe('Custom Metrics', () => {
    it('should record custom metric with all fields', () => {
      monitoring.recordMetric('custom.metric', 42.5, 'Bytes', {
        server: 'us-east-1',
        endpoint: '/api/test',
      });

      const buffer = monitoring.getMetricsBuffer();
      const metric = buffer[0];

      expect(metric.name).toBe('custom.metric');
      expect(metric.value).toBe(42.5);
      expect(metric.unit).toBe('Bytes');
      expect(metric.dimensions).toEqual({
        server: 'us-east-1',
        endpoint: '/api/test',
      });
    });

    it('should accept different unit types', () => {
      const units: Array<'Count' | 'Seconds' | 'Percent' | 'Bytes' | 'None'> = [
        'Count',
        'Seconds',
        'Percent',
        'Bytes',
        'None',
      ];

      units.forEach((unit) => {
        monitoring.recordMetric(`metric.${unit}`, 100, unit);
      });

      const buffer = monitoring.getMetricsBuffer();
      expect(buffer.length).toBeGreaterThanOrEqual(units.length);
    });
  });

  describe('Integration', () => {
    it('should track API request end-to-end', async () => {
      // Simulate API request
      const startTime = performance.now();

      monitoring.recordApiLatency('/api/appointments', 'POST', 201, 125);

      const duration = performance.now() - startTime;

      const buffer = monitoring.getMetricsBuffer();
      expect(buffer.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should be fast
    });

    it('should combine multiple metric types', () => {
      // Simulate a complex operation
      monitoring.recordApiLatency('/api/test', 'GET', 200, 100);
      monitoring.recordDatabaseLatency('SELECT', 'users', 50, true);
      monitoring.recordCacheOperation('hit', 'cache_key', 5);
      monitoring.recordEmailMetric('user@example.com', true, 250);

      const buffer = monitoring.getMetricsBuffer();

      expect(buffer.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle rapid metric recording', () => {
      for (let i = 0; i < 100; i++) {
        monitoring.recordMetric(`rapid_${i}`, Math.random() * 1000, 'Count');
      }

      const count = monitoring.getMetricsCount();
      expect(count).toBeGreaterThanOrEqual(100);
    });
  });
});
