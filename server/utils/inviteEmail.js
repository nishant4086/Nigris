import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.ethereal.email",
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInviteEmail = async ({ to, projectName, inviterName, inviteLink }) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #3b82f6; width: 40px; height: 40px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">N</div>
        <h2 style="color: #1e293b; margin-top: 10px;">Collaboration Invite</h2>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Hi there! <strong>${inviterName}</strong> has invited you to collaborate on the project <strong>"${projectName}"</strong> on Nigris.
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${inviteLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Accept Invitation
        </a>
      </div>
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 40px;">
        If you weren't expecting this invite, you can safely ignore this email. This invite link will expire in 7 days.
      </p>
    </div>
  `;

  return transporter.sendMail({
    from: `"Nigris" <${process.env.EMAIL_FROM || 'no-reply@nigris.app'}>`,
    to,
    subject: `Join ${projectName} on Nigris`,
    html,
  });
};
