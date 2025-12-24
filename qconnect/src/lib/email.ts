import { logger } from "./logger";
import { handleError } from "./errorHandler";

const PROVIDER = (process.env.EMAIL_PROVIDER || "ses").toLowerCase();

// AWS SES
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// SendGrid
import sendgrid from "@sendgrid/mail";

let sesClient: SESClient | null = null;
function getSesClient() {
  if (!sesClient) {
    sesClient = new SESClient({ region: process.env.AWS_REGION });
  }
  return sesClient;
}

if (PROVIDER === "sendgrid") {
  if (process.env.SENDGRID_API_KEY) sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
}

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    if (PROVIDER === "ses") {
      const sender = from || process.env.SES_EMAIL_SENDER!;
      const params = {
        Destination: { ToAddresses: [to] },
        Message: {
          Body: { Html: { Charset: "UTF-8", Data: html } },
          Subject: { Charset: "UTF-8", Data: subject },
        },
        Source: sender,
      };
      const ses = getSesClient();
      const resp = await ses.send(new SendEmailCommand(params));
      logger.info("Email sent (SES)", { to, messageId: (resp as any)?.MessageId });
      return { success: true, provider: "ses", messageId: (resp as any)?.MessageId };
    }

    if (PROVIDER === "sendgrid") {
      const sender = from || process.env.SENDGRID_SENDER!;
      const data = { to, from: sender, subject, html };
      const resp = await sendgrid.send(data as any);
      logger.info("Email sent (SendGrid)", { to, response: resp?.[0]?.headers });
      return { success: true, provider: "sendgrid" };
    }

    throw new Error(`Unsupported email provider: ${PROVIDER}`);
  } catch (err: any) {
    logger.error("Failed to send email", { err });
    throw err;
  }
}
