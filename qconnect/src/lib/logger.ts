function ts() { return new Date().toISOString(); }

export function info(message: string, meta: Record<string, unknown> = {}) {
  try {
    console.log(JSON.stringify({ timestamp: ts(), level: 'info', message, ...meta }));
  } catch {
    console.log(message, meta);
  }
}

export function warn(message: string, meta: Record<string, unknown> = {}) {
  try {
    console.warn(JSON.stringify({ timestamp: ts(), level: 'warn', message, ...meta }));
  } catch {
    console.warn(message, meta);
  }
}

export function error(message: string, meta: Record<string, unknown> = {}) {
  try {
    console.error(JSON.stringify({ timestamp: ts(), level: 'error', message, ...meta }));
  } catch {
    console.error(message, meta);
  }
}

export function debug(message: string, meta: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.debug(JSON.stringify({ timestamp: ts(), level: 'debug', message, ...meta }));
    } catch {
      console.debug(message, meta);
    }
  }
}

export const logger = { info, warn, error, debug };
export default logger;
