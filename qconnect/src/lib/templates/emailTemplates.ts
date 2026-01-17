/**
 * Email Templates for QConnect
 * Reusable HTML email templates for various transactional notifications
 */

export const welcomeTemplate = (userName: string) => `
  <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
      <h2 style="color: #007bff;">Welcome to QConnect, ${userName}!</h2>
      <p>We're thrilled to have you onboard 🎉</p>
      <p>Start managing your appointments and doctors from your dashboard.</p>
      <a href="https://app.qconnect.local/dashboard" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Get Started</a>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"/>
      <small style="color: #666;">This is an automated email. Please do not reply to this address.</small>
    </div>
  </div>
`;

export const passwordResetTemplate = (userName: string, resetLink: string, expiresInHours: number = 24) => `
  <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
      <h2 style="color: #ff6b6b;">Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password. This link expires in <strong>${expiresInHours} hours</strong>.</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #ff6b6b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
      <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"/>
      <small style="color: #666;">This is an automated email. Please do not reply to this address.</small>
    </div>
  </div>
`;

export const appointmentReminderTemplate = (userName: string, doctorName: string, appointmentTime: string, appointmentDetails?: string) => `
  <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
      <h2 style="color: #28a745;">Appointment Reminder</h2>
      <p>Hi ${userName},</p>
      <p>You have an upcoming appointment with <strong>Dr. ${doctorName}</strong> on <strong>${appointmentTime}</strong>.</p>
      ${appointmentDetails ? `<p><strong>Details:</strong> ${appointmentDetails}</p>` : ''}
      <a href="https://app.qconnect.local/appointments" style="display: inline-block; background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">View Appointment</a>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"/>
      <small style="color: #666;">This is an automated email. Please do not reply to this address.</small>
    </div>
  </div>
`;

export const securityAlertTemplate = (userName: string, alertType: string, actionRequired: boolean = false) => `
  <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
      <h2 style="color: #856404;">Security Alert</h2>
      <p>Hi ${userName},</p>
      <p><strong>${alertType}</strong></p>
      <p>We detected unusual activity on your account. ${actionRequired ? 'Please take action immediately to secure your account.' : 'No action is required at this time.'}</p>
      <a href="https://app.qconnect.local/account-security" style="display: inline-block; background-color: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Review Security</a>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"/>
      <small style="color: #666;">This is an automated email. Please do not reply to this address.</small>
    </div>
  </div>
`;

export const notificationTemplate = (userName: string, title: string, message: string, actionUrl?: string, actionLabel?: string) => `
  <div style="font-family: Arial, sans-serif; color: #111; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
      <h2 style="color: #007bff;">${title}</h2>
      <p>Hi ${userName},</p>
      <p>${message}</p>
      ${actionUrl && actionLabel ? `<a href="${actionUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">${actionLabel}</a>` : ''}
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;"/>
      <small style="color: #666;">This is an automated email. Please do not reply to this address.</small>
    </div>
  </div>
`;
