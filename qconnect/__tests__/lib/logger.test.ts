/**
 * Unit Tests for Logger Utility
 * Tests structured JSON logging with correlation IDs
 * 
 * Test Coverage:
 * - Basic logging functions (info, warn, error, debug)
 * - Context management (setContext, getContext, clearContext)
 * - Specialized logging functions
 * - Error stack trace capture
 * - Request/response logging
 * - Database operation logging
 * - Email operation logging
 * - Authentication event logging
 */

import logger from '@/lib/logger';

describe('Logger Utility', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    logger.clearContext();
  });

  describe('Basic Logging', () => {
    it('should log info message as JSON', () => {
      logger.info('Test message', { userId: 'user_123' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry).toMatchObject({
        level: 'info',
        message: 'Test message',
        userId: 'user_123',
      });
      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry).toHaveProperty('service', 'qconnect');
    });

    it('should log warn message', () => {
      logger.warn('Warning message', { severity: 'high' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleWarnSpy.mock.calls[0][0]);

      expect(logEntry.level).toBe('warn');
      expect(logEntry.message).toBe('Warning message');
      expect(logEntry.severity).toBe('high');
    });

    it('should log error message', () => {
      logger.error('Error message', { error: 'DB connection failed' });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(logEntry.level).toBe('error');
      expect(logEntry.message).toBe('Error message');
      expect(logEntry.error).toBe('DB connection failed');
    });

    it('should log debug message only in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logger.debug('Debug message', { value: 42 });

      expect(consoleLogSpy).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const spy = jest.spyOn(console, 'debug').mockImplementation();
      logger.debug('Debug message');

      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Context Management', () => {
    it('should set and get context', () => {
      const requestId = logger.setContext({
        userId: 'user_123',
        endpoint: '/api/appointments',
        method: 'POST',
      });

      const context = logger.getContext();

      expect(context.userId).toBe('user_123');
      expect(context.endpoint).toBe('/api/appointments');
      expect(context.method).toBe('POST');
      expect(context.requestId).toBe(requestId);
    });

    it('should generate unique requestId', () => {
      const id1 = logger.setContext({});
      const id2 = logger.setContext({});

      expect(id1).not.toBe(id2);
    });

    it('should include context in all logs', () => {
      logger.setContext({ userId: 'user_456', endpoint: '/api/users' });
      logger.info('User action');

      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.userId).toBe('user_456');
      expect(logEntry.endpoint).toBe('/api/users');
      expect(logEntry).toHaveProperty('requestId');
    });

    it('should clear context', () => {
      logger.setContext({ userId: 'user_123' });
      logger.clearContext();

      const context = logger.getContext();

      expect(context.userId).toBeUndefined();
      expect(context.requestId).toBeUndefined();
    });

    it('should merge context updates', () => {
      logger.setContext({ userId: 'user_123' });
      logger.setContext({ endpoint: '/api/appointments' });

      const context = logger.getContext();

      expect(context.userId).toBe('user_123');
      expect(context.endpoint).toBe('/api/appointments');
    });
  });

  describe('Specialized Logging Functions', () => {
    it('should log HTTP request', () => {
      const requestId = logger.logRequest('POST', '/api/appointments', 'user_123');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.message).toContain('HTTP request received');
      expect(logEntry.method).toBe('POST');
      expect(logEntry.endpoint).toBe('/api/appointments');
      expect(logEntry.userId).toBe('user_123');
      expect(requestId).toBeDefined();
    });

    it('should log HTTP response', () => {
      logger.logResponse(201, 125, { data: 'success' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.message).toContain('HTTP response sent');
      expect(logEntry.statusCode).toBe(201);
      expect(logEntry.duration).toBe(125);
      expect(logEntry.data).toBe('success');
    });

    it('should log database operation', () => {
      logger.logDatabase('SELECT', 'users', 45, true);

      expect(consoleLogSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.table).toBe('users');
      expect(logEntry.operation).toBe('SELECT');
      expect(logEntry.duration).toBe(45);
      expect(logEntry.success).toBe(true);
    });

    it('should log failed database operation', () => {
      logger.logDatabase('INSERT', 'users', 100, false, 'Unique constraint violation');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(logEntry.success).toBe(false);
      expect(logEntry.error).toBe('Unique constraint violation');
    });

    it('should log cache operation', () => {
      logger.logCache('hit', 'user_123_key', 5);

      expect(consoleLogSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.operation).toBe('hit');
      expect(logEntry.key).toBe('user_123_key');
      expect(logEntry.duration).toBe(5);
    });

    it('should log email operation', () => {
      logger.logEmail('user@example.com', 'Welcome Email', true, 250);

      expect(consoleLogSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.recipient).toBe('user@example.com');
      expect(logEntry.subject).toBe('Welcome Email');
      expect(logEntry.success).toBe(true);
      expect(logEntry.duration).toBe(250);
    });

    it('should log authentication event', () => {
      logger.logAuth('login', 'user_123', true, { method: 'email' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.event).toBe('login');
      expect(logEntry.userId).toBe('user_123');
      expect(logEntry.success).toBe(true);
      expect(logEntry.method).toBe('email');
    });

    it('should log failed authentication event', () => {
      logger.logAuth('login', 'user_123', false, { reason: 'Invalid password' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleWarnSpy.mock.calls[0][0]);

      expect(logEntry.success).toBe(false);
      expect(logEntry.reason).toBe('Invalid password');
    });

    it('should log business event', () => {
      logger.logEvent('appointment_created', 'user_123', { appointmentId: 'apt_456' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.eventName).toBe('appointment_created');
      expect(logEntry.userId).toBe('user_123');
      expect(logEntry.appointmentId).toBe('apt_456');
    });

    it('should log performance metrics', () => {
      logger.logPerformance('complexOperation', 1500, { operationType: 'calculation' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleWarnSpy.mock.calls[0][0]);

      expect(logEntry.operationName).toBe('complexOperation');
      expect(logEntry.duration).toBe(1500);
      expect(logEntry.threshold).toBe('SLOW');
    });

    it('should log normal performance', () => {
      logger.logPerformance('fastOperation', 50);

      expect(consoleLogSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.threshold).toBe('NORMAL');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-serializable objects gracefully', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      // Should not throw
      expect(() => {
        logger.info('Test', { circular });
      }).not.toThrow();
    });

    it('should capture error stack traces', () => {
      const error = new Error('Test error');

      logger.error('Something failed', { error });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(logEntry.errorStack).toBeDefined();
      expect(logEntry.errorStack).toContain('Error: Test error');
    });
  });

  describe('Log Structure', () => {
    it('should always include timestamp', () => {
      logger.info('Test');

      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.timestamp).toBeDefined();
      expect(logEntry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should always include service name', () => {
      logger.info('Test');

      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.service).toBe('qconnect');
    });

    it('should always include log level', () => {
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      const infoLog = JSON.parse(consoleLogSpy.mock.calls[0][0]);
      const warnLog = JSON.parse(consoleWarnSpy.mock.calls[0][0]);
      const errorLog = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(infoLog.level).toBe('info');
      expect(warnLog.level).toBe('warn');
      expect(errorLog.level).toBe('error');
    });

    it('should include all metadata passed', () => {
      logger.info('Test', { key1: 'value1', key2: 'value2', key3: 123 });

      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry.key1).toBe('value1');
      expect(logEntry.key2).toBe('value2');
      expect(logEntry.key3).toBe(123);
    });
  });

  describe('Integration', () => {
    it('should work with request lifecycle', () => {
      // Start request
      const requestId = logger.logRequest('POST', '/api/test', 'user_123');

      // Log some actions
      logger.info('Processing data', { step: 1 });
      logger.info('Data processed', { step: 2 });

      // End request
      logger.logResponse(200, 100);

      // Clear context
      logger.clearContext();

      // Verify all logs have same requestId
      const calls = consoleLogSpy.mock.calls;
      const logs = calls.map((call) => JSON.parse(call[0]));

      expect(logs[0].requestId).toBe(requestId);
      expect(logs[1].requestId).toBe(requestId);
      expect(logs[2].requestId).toBe(requestId);
      expect(logs[3].requestId).toBe(requestId);
    });

    it('should handle errors during request lifecycle', () => {
      const requestId = logger.logRequest('POST', '/api/test');

      // Simulate error
      const error = new Error('Database error');
      logger.error('Request failed', { error });

      // End request with error status
      logger.logResponse(500, 50);

      logger.clearContext();

      expect(consoleErrorSpy).toHaveBeenCalled();

      // Verify error log has context
      const errorLog = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(errorLog.requestId).toBe(requestId);
    });
  });
});
