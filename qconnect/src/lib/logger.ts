/**
 * Structured JSON logging utility for CloudWatch/Azure Monitor
 * Provides correlation IDs for tracing, structured metadata, and performance metrics
 */

interface LogContext {
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  service?: string;
}

// Thread-local context simulation (store in a WeakMap for better cleanup)
const contextMap = new Map<string, LogContext>();

function ts(): string {
  return new Date().toISOString();
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Set request context for correlation and tracing
 */
export function setContext(context: Partial<LogContext>): string {
  const requestId = context.requestId || generateRequestId();
  contextMap.set('current', { ...contextMap.get('current'), ...context, requestId });
  return requestId;
}

/**
 * Get current request context
 */
export function getContext(): LogContext {
  return contextMap.get('current') || {};
}

/**
 * Clear context (call at end of request)
 */
export function clearContext(): void {
  contextMap.delete('current');
}

function buildLogEntry(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  meta: Record<string, unknown> = {}
) {
  const context = getContext();
  return {
    timestamp: ts(),
    level,
    message,
    requestId: context.requestId || generateRequestId(),
    userId: context.userId,
    service: context.service || 'qconnect',
    endpoint: context.endpoint,
    method: context.method,
    statusCode: context.statusCode,
    duration: context.duration, // milliseconds
    ...meta,
  };
}

export function info(message: string, meta: Record<string, unknown> = {}) {
  try {
    const logEntry = buildLogEntry('info', message, meta);
    console.log(JSON.stringify(logEntry));
  } catch (err) {
    console.log(message, meta);
  }
}

export function warn(message: string, meta: Record<string, unknown> = {}) {
  try {
    const logEntry = buildLogEntry('warn', message, meta);
    console.warn(JSON.stringify(logEntry));
  } catch (err) {
    console.warn(message, meta);
  }
}

export function error(message: string, meta: Record<string, unknown> = {}) {
  try {
    const logEntry = buildLogEntry('error', message, meta);
    // Include error stack trace if available
    if (meta.error instanceof Error) {
      logEntry.errorStack = meta.error.stack;
    }
    console.error(JSON.stringify(logEntry));
  } catch (err) {
    console.error(message, meta);
  }
}

export function debug(message: string, meta: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const logEntry = buildLogEntry('debug', message, meta);
      console.debug(JSON.stringify(logEntry));
    } catch (err) {
      console.debug(message, meta);
    }
  }
}

/**
 * Log HTTP request
 */
export function logRequest(
  method: string,
  endpoint: string,
  userId?: string,
  requestId?: string
) {
  const id = setContext({
    requestId: requestId || generateRequestId(),
    method,
    endpoint,
    userId,
    service: 'qconnect',
  });

  info('HTTP request received', {
    method,
    endpoint,
    userId,
  });

  return id;
}

/**
 * Log HTTP response
 */
export function logResponse(
  statusCode: number,
  duration: number,
  meta: Record<string, unknown> = {}
) {
  const context = getContext();
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  const logFn = level === 'error' ? error : level === 'warn' ? warn : info;
  logFn('HTTP response sent', {
    statusCode,
    duration,
    ...meta,
  });
}

/**
 * Log database operation
 */
export function logDatabase(
  operation: string,
  table: string,
  duration: number,
  success: boolean,
  error?: string
) {
  const level = success ? 'info' : 'error';
  const logFn = level === 'error' ? error : info;

  logFn(`Database ${operation}`, {
    table,
    operation,
    duration,
    success,
    ...(error && { error }),
  });
}

/**
 * Log cache operation
 */
export function logCache(
  operation: 'hit' | 'miss' | 'set' | 'delete',
  key: string,
  duration?: number
) {
  info('Cache operation', {
    operation,
    key,
    ...(duration && { duration }),
  });
}

/**
 * Log email operation
 */
export function logEmail(
  recipient: string,
  subject: string,
  success: boolean,
  duration?: number,
  error?: string
) {
  const level = success ? 'info' : 'error';
  const logFn = level === 'error' ? error : info;

  logFn('Email operation', {
    recipient,
    subject,
    success,
    ...(duration && { duration }),
    ...(error && { error }),
  });
}

/**
 * Log authentication event
 */
export function logAuth(
  event: 'login' | 'logout' | 'signup' | 'mfa_success' | 'mfa_failed',
  userId: string,
  success: boolean,
  meta: Record<string, unknown> = {}
) {
  const level = success ? 'info' : 'warn';
  const logFn = level === 'warn' ? warn : info;

  setContext({ userId });

  logFn(`Authentication event: ${event}`, {
    event,
    userId,
    success,
    ...meta,
  });
}

/**
 * Log business event
 */
export function logEvent(
  eventName: string,
  userId?: string,
  meta: Record<string, unknown> = {}
) {
  if (userId) setContext({ userId });

  info(`Event: ${eventName}`, {
    eventName,
    userId,
    ...meta,
  });
}

/**
 * Log with performance timing
 */
export function logPerformance(
  operationName: string,
  duration: number,
  meta: Record<string, unknown> = {}
) {
  const level = duration > 1000 ? 'warn' : 'info';
  const logFn = level === 'warn' ? warn : info;

  logFn(`Performance: ${operationName}`, {
    operationName,
    duration,
    threshold: duration > 1000 ? 'SLOW' : 'NORMAL',
    ...meta,
  });
}

export const logger = {
  info,
  warn,
  error,
  debug,
  setContext,
  getContext,
  clearContext,
  logRequest,
  logResponse,
  logDatabase,
  logCache,
  logEmail,
  logAuth,
  logEvent,
  logPerformance,
};

export default logger;
