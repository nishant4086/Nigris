import { Resend } from 'resend';
import nodemailer from "nodemailer";
import { 
  verificationTemplate, 
  passwordResetTemplate, 
  welcomeTemplate 
} from './emailTemplates.js';

let resend;
let testTransporter;

// Initialize Resend
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log("==> 📧 Resend Email Service initialized");
} else if (process.env.NODE_ENV !== "production") {
  console.warn("==> ⚠️ RESEND_API_KEY missing. Falling back to Ethereal for development.");
}

/**
 * Reusable send email function
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text fallback
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  // 1. Validation
  if (!to || !subject || !html) {
    throw new Error("Missing required email fields (to, subject, html)");
  }

  const from = process.env.EMAIL_FROM || "Nigris <onboarding@resend.dev>";

  // 2. Production/Staging: Use Resend
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text: text || "Please view this email in an HTML-compatible client.",
      });

      if (error) {
        console.error("[Resend Error]:", error);
        throw new Error(`Failed to send email via Resend: ${error.message}`);
      }

      console.log(`[Email Sent] ID: ${data.id} to ${to}`);
      return data;
    } catch (err) {
      console.error("[Email Service Failure]:", err.message);
      throw err;
    }
  }

  // 3. Development Fallback: Use Ethereal
  if (process.env.NODE_ENV !== "production") {
    try {
      if (!testTransporter) {
        const testAccount = await nodemailer.createTestAccount();
        testTransporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await testTransporter.sendMail({
        from: `"Dev Nigris" <${testTransporter.options.auth.user}>`,
        to,
        subject,
        html,
        text: text || "HTML fallback",
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[Dev Email] Preview URL: ${previewUrl}`);
      return { id: info.messageId, previewUrl };
    } catch (err) {
      console.error("[Ethereal Fallback Failure]:", err.message);
      throw err;
    }
  }

  throw new Error("Email service not configured (RESEND_API_KEY missing)");
};

/**
 * Send Verification Email
 */
export const sendVerificationEmail = async (to, token) => {
  const url = `${process.env.APP_BASE_URL || "https://nigris.vercel.app"}/verify-email/${token}`;
  
  return sendEmail({
    to,
    subject: "Verify your email - Nigris",
    html: verificationTemplate(url),
    text: `Welcome to Nigris! Verify your email at: ${url}`
  });
};

/**
 * Send Password Reset Email
 */
export const sendResetPasswordEmail = async (to, token) => {
  const url = `${process.env.APP_BASE_URL || "https://nigris.vercel.app"}/reset-password?token=${token}`;
  
  return sendEmail({
    to,
    subject: "Reset your password - Nigris",
    html: passwordResetTemplate(url),
    text: `You requested a password reset. Reset it here: ${url}`
  });
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (to, name) => {
  return sendEmail({
    to,
    subject: "Welcome to Nigris!",
    html: welcomeTemplate(name),
    text: `Welcome to Nigris, ${name}! We're thrilled to have you on board.`
  });
};
