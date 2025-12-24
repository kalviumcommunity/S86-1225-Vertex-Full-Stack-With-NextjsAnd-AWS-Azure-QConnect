export const logger = {
  info: (message: string, meta?: any) => {
    try {
      console.log(JSON.stringify({ level: "info", message, meta, timestamp: new Date().toISOString() }));
    } catch {
      console.log(message, meta);
    }
  },
  error: (message: string, meta?: any) => {
    try {
      console.error(JSON.stringify({ level: "error", message, meta, timestamp: new Date().toISOString() }));
    } catch {
      console.error(message, meta);
    }
  },
};
