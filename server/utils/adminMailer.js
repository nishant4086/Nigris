import nodemailer from "nodemailer";

/**
 * Sends an email alert to the admin when a critical system error occurs.
 */
export const sendAdminErrorAlert = async (errorDoc) => {
  const host = process.env.SMTP_HOST || process.env.SYSTEM_SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.SYSTEM_SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SYSTEM_SMTP_PASS;
  const port = process.env.SMTP_PORT || process.env.SYSTEM_SMTP_PORT || 587;

  // Skip if no global SMTP config is found
  if (!host || !user || !pass) {
    console.warn("[AdminMailer] Missing global SMTP variables. Skipping error alert email.");
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"Nigris Alerts" <${user}>`,
      to: "r.nishant4806@gmail.com",
      subject: `[Nigris Alert] Critical Error: ${errorDoc.statusCode || 500} on ${errorDoc.route || 'Unknown'}`,
      html: `
        <h2>Critical System Error Detected</h2>
        <p><strong>Status Code:</strong> ${errorDoc.statusCode || 500}</p>
        <p><strong>Route:</strong> ${errorDoc.method || 'GET'} ${errorDoc.route || 'Unknown'}</p>
        <p><strong>Trace ID:</strong> ${errorDoc.traceId || 'N/A'}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr />
        <h3>Error Message</h3>
        <pre>${errorDoc.message}</pre>
        <h3>Stack Trace</h3>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">
          ${errorDoc.stackTrace || "No stack trace provided."}
        </pre>
        <br />
        <p>Please check the admin dashboard for more details.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[AdminMailer] Sent error alert to r.nishant4806@gmail.com`);
  } catch (err) {
    console.error("[AdminMailer] Failed to send error alert:", err.message);
  }
};
