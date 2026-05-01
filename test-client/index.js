const axios = require("axios");

const NGROK_BASE_URL = "https://copilot-perish-sagging.ngrok-free.dev";
const API_KEY = "b1f380c99e1f11def0aea086da0f8cc857747428469da18c9e0791a6334eedf4";

async function run() {
  try {
    const response = await axios.get(`${NGROK_BASE_URL}/api/public/collections`, {
      headers: {
        "x-api-key": API_KEY,
      },
      timeout: 15000,
    });

    console.log("Status:", response.status);
    console.log("Collections:", response.data);
  } catch (error) {
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else {
      console.error("Request failed:", error.message);
    }
  }
}

run();