import "dotenv/config";
import mailService from "./services/mailService.js";

async function test() {
  console.log("Testing mailService directly...");
  try {
    const result = await mailService.testConnection({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      username: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASS
    });
    console.log("Success:", result);
  } catch (err) {
    console.error("Failed:", err.message);
  }
  process.exit();
}

test();
