import nodemailer from "nodemailer";

let transporter;
let usingTestAccount = false;

const resolveFromAddress = () => {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;

  const fallbackAddress = process.env.EMAIL_USER || "noreply@nigris.com";
  return `"Nigris" <${fallbackAddress}>`;
};

const resolveEmailPort = () => {
  const port = Number(process.env.EMAIL_PORT);
  return Number.isInteger(port) && port > 0 ? port : 587;
};

const initializeTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const emailPort = resolveEmailPort();
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    usingTestAccount = false;
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    usingTestAccount = true;
    console.warn("Using Ethereal Mail for development. Set EMAIL_USER and EMAIL_PASS to send real email.");
  }

  try {
    await transporter.verify();
  } catch (error) {
    transporter = null;
    throw error;
  }

  return transporter;
};

if (process.env.NODE_ENV !== "test") {
  initializeTransporter().catch((error) => {
    console.error("Email transporter initialization failed:", error);
  });
}

const sendMail = async (message) => {
  if (process.env.NODE_ENV === "test") {
    return { accepted: [message.to], messageId: "test-message-id" };
  }

  const activeTransporter = await initializeTransporter();
  const info = await activeTransporter.sendMail({
    from: resolveFromAddress(),
    ...message,
  });

  if (usingTestAccount) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview URL: %s", previewUrl);
    }
  }

  return info;
};

export const sendVerificationEmail = async (to, token) => {
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email/${token}`;

  return sendMail({
    to,
    subject: "Verify your email - Nigris",
    text: [
      "Welcome to Nigris!",
      "",
      "Verify your email address to activate your account:",
      url,
      "",
      "This link will expire in 24 hours.",
    ].join("\n"),
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e293b;">Welcome to Nigris!</h2>
        <p>Please click the button below to verify your email address and activate your account.</p>
        <div style="margin: 30px 0;">
          <a href="${url}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #334155; font-size: 14px;">If the button does not work, copy and paste this link into your browser:<br>${url}</p>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours.</p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (to, token) => {
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  return sendMail({
    to,
    subject: "Reset your password - Nigris",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e293b;">Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to choose a new password.</p>
        <div style="margin: 30px 0;">
          <a href="${url}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
      </div>
    `,
  });
};
