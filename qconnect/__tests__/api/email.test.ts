/**
 * Integration Tests for Email API
 * Tests for /api/email route with mocked sendEmail function
 */

import { POST } from "@/app/api/email/route";
import * as emailLib from "@/lib/email";
import { NextResponse } from "next/server";

// Mock the email library
jest.mock("@/lib/email");
jest.mock("@/lib/errorHandler", () => ({
  handleError: jest.fn((err, context) => {
    console.error(`Error in ${context}:`, err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }),
}));

describe("POST /api/email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send email successfully with SES", async () => {
    const mockSendEmail = emailLib.sendEmail as jest.MockedFunction<typeof emailLib.sendEmail>;
    mockSendEmail.mockResolvedValueOnce({
      success: true,
      provider: "ses",
      messageId: "01010189b2example123",
    });

    const req = new Request("http://localhost:3000/api/email", {
      method: "POST",
      body: JSON.stringify({
        to: "user@example.com",
        subject: "Welcome to QConnect",
        message: "<h3>Hello from QConnect 🚀</h3>",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.messageId).toBe("01010189b2example123");
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "user@example.com",
      subject: "Welcome to QConnect",
      html: "<h3>Hello from QConnect 🚀</h3>",
    });
  });

  it("should send email successfully with SendGrid", async () => {
    const mockSendEmail = emailLib.sendEmail as jest.MockedFunction<typeof emailLib.sendEmail>;
    mockSendEmail.mockResolvedValueOnce({
      success: true,
      provider: "sendgrid",
    });

    const req = new Request("http://localhost:3000/api/email", {
      method: "POST",
      body: JSON.stringify({
        to: "student@example.com",
        subject: "Appointment Reminder",
        message: "<p>You have an upcoming appointment</p>",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.provider).toBe("sendgrid");
    expect(mockSendEmail).toHaveBeenCalled();
  });

  it("should return 400 if required fields are missing", async () => {
    const req = new Request("http://localhost:3000/api/email", {
      method: "POST",
      body: JSON.stringify({
        to: "user@example.com",
        subject: "Welcome",
        // message is missing
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain("required");
  });

  it("should handle missing 'to' field", async () => {
    const req = new Request("http://localhost:3000/api/email", {
      method: "POST",
      body: JSON.stringify({
        subject: "Welcome",
        message: "<h1>Hello</h1>",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should handle email send errors gracefully", async () => {
    const mockSendEmail = emailLib.sendEmail as jest.MockedFunction<typeof emailLib.sendEmail>;
    mockSendEmail.mockRejectedValueOnce(new Error("Email service unavailable"));

    const req = new Request("http://localhost:3000/api/email", {
      method: "POST",
      body: JSON.stringify({
        to: "user@example.com",
        subject: "Test",
        message: "<p>Test</p>",
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });

  it("should send password reset email", async () => {
    const mockSendEmail = emailLib.sendEmail as jest.MockedFunction<typeof emailLib.sendEmail>;
    mockSendEmail.mockResolvedValueOnce({
      success: true,
      provider: "ses",
      messageId: "reset-email-123",
    });

    const resetLink = "https://app.qconnect.local/reset-password?token=abc123";
    const req = new Request("http://localhost:3000/api/email", {
      method: "POST",
      body: JSON.stringify({
        to: "user@example.com",
        subject: "Reset Your Password",
        message: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Reset Your Password",
      })
    );
  });

  it("should send appointment reminder email", async () => {
    const mockSendEmail = emailLib.sendEmail as jest.MockedFunction<typeof emailLib.sendEmail>;
    mockSendEmail.mockResolvedValueOnce({
      success: true,
      provider: "sendgrid",
    });

    const appointmentMessage =
      "<h2>Appointment Reminder</h2><p>Dr. Smith on Jan 20, 2026 at 2:30 PM</p>";
    const req = new Request("http://localhost:3000/api/email", {
      method: "POST",
      body: JSON.stringify({
        to: "patient@example.com",
        subject: "Appointment Reminder: Dr. Smith",
        message: appointmentMessage,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("Appointment"),
      })
    );
  });

  it("should handle invalid JSON in request body", async () => {
    const req = new Request("http://localhost:3000/api/email", {
      method: "POST",
      body: "invalid json",
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
  });
});
