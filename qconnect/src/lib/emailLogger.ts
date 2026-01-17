/**
 * Email Logger Utility
 * Tracks email sends with metadata for monitoring and debugging
 */

import { logger } from "./logger";

export interface EmailLog {
  id?: string;
  to: string;
  subject: string;
  provider: "ses" | "sendgrid";
  messageId?: string;
  status: "success" | "failed";
  timestamp: Date;
  error?: string;
  metadata?: Record<string, any>;
}

// In-memory store for email logs (in production, use a database)
const emailLogs: EmailLog[] = [];

/**
 * Log a successful email send
 */
export function logEmailSent(
  to: string,
  subject: string,
  provider: "ses" | "sendgrid",
  messageId?: string,
  metadata?: Record<string, any>
) {
  const emailLog: EmailLog = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to,
    subject,
    provider,
    messageId,
    status: "success",
    timestamp: new Date(),
    metadata,
  };

  emailLogs.push(emailLog);
  logger.info("Email sent successfully", {
    to,
    subject,
    provider,
    messageId,
    ...metadata,
  });

  return emailLog;
}

/**
 * Log a failed email send
 */
export function logEmailFailed(
  to: string,
  subject: string,
  provider: "ses" | "sendgrid",
  error: Error,
  metadata?: Record<string, any>
) {
  const emailLog: EmailLog = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to,
    subject,
    provider,
    status: "failed",
    timestamp: new Date(),
    error: error.message,
    metadata,
  };

  emailLogs.push(emailLog);
  logger.error("Email send failed", {
    to,
    subject,
    provider,
    error: error.message,
    ...metadata,
  });

  return emailLog;
}

/**
 * Get email logs with optional filtering
 */
export function getEmailLogs(options?: {
  limit?: number;
  offset?: number;
  status?: "success" | "failed";
  provider?: "ses" | "sendgrid";
  to?: string;
}): EmailLog[] {
  let filtered = [...emailLogs];

  if (options?.status) {
    filtered = filtered.filter((log) => log.status === options.status);
  }

  if (options?.provider) {
    filtered = filtered.filter((log) => log.provider === options.provider);
  }

  if (options?.to) {
    filtered = filtered.filter((log) => log.to === options.to);
  }

  // Sort by timestamp (newest first)
  filtered.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const offset = options?.offset || 0;
  const limit = options?.limit || 50;

  return filtered.slice(offset, offset + limit);
}

/**
 * Get email statistics
 */
export function getEmailStats() {
  const totalSent = emailLogs.length;
  const successful = emailLogs.filter((log) => log.status === "success").length;
  const failed = emailLogs.filter((log) => log.status === "failed").length;
  const sesSent = emailLogs.filter(
    (log) => log.provider === "ses" && log.status === "success"
  ).length;
  const sendgridSent = emailLogs.filter(
    (log) => log.provider === "sendgrid" && log.status === "success"
  ).length;

  return {
    totalSent,
    successful,
    failed,
    successRate: totalSent > 0 ? ((successful / totalSent) * 100).toFixed(2) : "0.00",
    byProvider: {
      ses: sesSent,
      sendgrid: sendgridSent,
    },
  };
}

/**
 * Clear email logs (use with caution)
 */
export function clearEmailLogs() {
  emailLogs.length = 0;
  logger.info("Email logs cleared");
}
