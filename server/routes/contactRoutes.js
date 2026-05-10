import express from "express";
import ContactMessage from "../models/ContactMessage.js";
import ActivityLog from "../models/ActivityLog.js";

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

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
