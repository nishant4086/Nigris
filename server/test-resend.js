import "dotenv/config";
import { sendEmail } from "./utils/emailService.js";

async function testResend() {
  console.log("🚀 Testing Resend Integration...");
  
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_123456789') {
      console.warn("⚠️  No valid RESEND_API_KEY found in .env. Falling back to Ethereal.");
    }

    const result = await sendEmail({
      to: "nishant.24jicys018@jietjodhpur.ac.in", 
      subject: "Nigris Resend Test",
      html: "<h1>It works!</h1><p>Resend integration is active.</p>",
      text: "It works! Resend integration is active."
    });

    console.log("✅ Test successful!");
    console.log("Result:", result);
  } catch (error) {
    console.error("❌ Test failed!");
    console.error(error.message);
  }
}

testResend();
