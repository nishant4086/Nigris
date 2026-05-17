import express from "express";
import ContactMessage from "../models/ContactMessage.js";
import ActivityLog from "../models/ActivityLog.js";
import { sendEmail } from "../utils/emailService.js";

const router = express.Router();

// POST /api/contact — public, no auth
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const msg = await ContactMessage.create({ name, email, subject, message });

    // Log activity
    await ActivityLog.create({
      action: "contact_form_submitted",
      resource: "ContactMessage",
      resourceId: msg._id.toString(),
      details: `New contact from ${name} (${email})`,
    });

    // Send email notification to the receiving address
    try {
      await sendEmail({
        to: "nigris@zoriopea.resend.app", // The receiving address
        subject: `New Contact Form Submission: ${subject || "No Subject"}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<h3>New Contact Submission</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br>")}</p>`,
      });
    } catch (emailError) {
      console.error("Failed to send contact notification email:", emailError);
      // We don't fail the request if just the email fails, since it's saved in DB
    }

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
