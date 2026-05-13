/**
 * Email Templates for Nigris Platform
 */

const primaryColor = "#3b82f6";
const secondaryColor = "#1e293b";
const textColor = "#334155";
const lightTextColor = "#64748b";

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: ${textColor}; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .logo { font-size: 24px; font-weight: bold; color: ${primaryColor}; text-decoration: none; }
    .content { background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: ${lightTextColor}; }
    .button { display: inline-block; background-color: ${primaryColor}; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .divider { height: 1px; background-color: #e2e8f0; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://nigris.vercel.app" class="logo">NIGRIS</a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Nigris Platform. All rights reserved.</p>
      <p>If you have any questions, contact us at support@nigris.com</p>
    </div>
  </div>
</body>
</html>
`;

export const verificationTemplate = (url) => baseTemplate(`
  <h2 style="color: ${secondaryColor};">Verify your email address</h2>
  <p>Welcome to Nigris! We're excited to have you on board. Before we get started, we need to verify your email address.</p>
  <div style="text-align: center;">
    <a href="${url}" class="button">Verify Email Address</a>
  </div>
  <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
  <p style="word-break: break-all; color: ${primaryColor}; font-size: 14px;">${url}</p>
  <div class="divider"></div>
  <p style="font-size: 14px; color: ${lightTextColor};">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
`);

export const passwordResetTemplate = (url) => baseTemplate(`
  <h2 style="color: ${secondaryColor};">Reset your password</h2>
  <p>We received a request to reset the password for your Nigris account. Click the button below to proceed.</p>
  <div style="text-align: center;">
    <a href="${url}" class="button">Reset Password</a>
  </div>
  <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
  <p style="word-break: break-all; color: ${primaryColor}; font-size: 14px;">${url}</p>
  <div class="divider"></div>
  <p style="font-size: 14px; color: ${lightTextColor};">This link will expire in 1 hour.</p>
`);

export const welcomeTemplate = (name) => baseTemplate(`
  <h2 style="color: ${secondaryColor};">Welcome to Nigris, ${name}!</h2>
  <p>We're thrilled to have you join our community. Nigris is built to help you manage your projects with ease and security.</p>
  <p>You now have access to:</p>
  <ul style="color: ${textColor}; padding-left: 20px;">
    <li>Advanced project analytics</li>
    <li>Customizable data collections</li>
    <li>Secure API management</li>
    <li>Team collaboration tools</li>
  </ul>
  <div style="text-align: center;">
    <a href="https://nigris.vercel.app/dashboard" class="button">Go to Dashboard</a>
  </div>
  <p>Best regards,<br>The Nigris Team</p>
`);
