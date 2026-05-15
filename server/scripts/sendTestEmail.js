// Quick test script: node scripts/sendTestEmail.js
import "dotenv/config";
import { sendEmail } from "../utils/emailService.js";

const TO = process.argv[2] || "r.nishant4806@gmail.com";

(async () => {
  console.log(`\n→ Sending test email to: ${TO}`);
  console.log(`→ Using EMAIL_FROM: ${process.env.EMAIL_FROM || "(not set)"}`);
  console.log(`→ RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "set ✓" : "missing ✗"}\n`);

  try {
    const result = await sendEmail({
      to: TO,
      subject: "Nigris — Test Email",
      html: `
        <div style="font-family:sans-serif;padding:24px">
          <h2>Hello from Nigris 👋</h2>
          <p>If you're reading this, your Resend setup is working.</p>
          <p><small>Sent at ${new Date().toISOString()}</small></p>
        </div>
      `,
      text: "Hello from Nigris! If you're reading this, your Resend setup is working.",
    });
    console.log("✅ SUCCESS:", result);
    process.exit(0);
  } catch (err) {
    console.error("\n❌ FAILED:", err.message);
    process.exit(1);
  }
})();
