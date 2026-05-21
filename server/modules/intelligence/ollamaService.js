import axios from "axios";
import crypto from "crypto";
import pino from "pino";

const logger = pino();

const OLLAMA_URL =
  process.env.OLLAMA_URL ||
  "http://ollama:11434/api/generate";

const MODEL =
  process.env.OLLAMA_MODEL ||
  "llama3";

const REQUEST_TIMEOUT = 45000;

const mockResponses = {
  healthScores: [88, 92, 95, 85, 98, 81],

  criticalIssues: [
    "Redis memory nearing 80% threshold",
    "High latency spike observed on /api/billing/webhook",
    "Database connection pool occasionally saturated",
    "Spike in 500 errors on /api/public/entries",
    "CPU utilization reached 90% during peak hours",
    "Unusually high number of failed login attempts from a single subnet",
  ],

  performanceInsights: [
    "API latency improved by 14% this week",
    "MongoDB query times are stable",
    "Consider adding Redis caching to /api/public/projects",
    "Static assets could be served faster via CDN",
    "Background worker queue processing time has decreased",
    "Memory usage on Node processes is stable and well-optimized",
  ],

  securityInsights: [
    "4 suspicious IPs automatically blocked by rate limiter",
    "No new brute-force attempts detected",
    "All API keys are actively rotated",
    "CORS policy effectively blocking unauthorized cross-origin requests",
    "Rate limiters prevented 2 potential DDoS attempts",
    "JWT tokens are expiring and refreshing as expected",
  ],

  recommendations: [
    "Implement a retry queue for failed webhooks",
    "Add pagination to the /api/logs endpoint",
    "Consider upgrading database instance size before Q3",
    "Enable Brotli compression in Express",
    "Audit unused API keys and revoke them",
    "Set up automated database backups",
  ],

  predictions: [
    "Database storage will need expansion in ~45 days",
    "Expected traffic surge on Friday",
    "User growth is trending up 20% MoM",
    "Infrastructure can support 5x current load",
    "Cache hit ratio may drop after next feature release",
    "Weekly active users predicted to hit all-time high",
  ],
};

const randomItems = (arr, count) => {
  return [...arr]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
};

const generateMockData = () => {
  return {
    healthScore:
      mockResponses.healthScores[
      Math.floor(
        Math.random() *
        mockResponses.healthScores.length
      )
      ],

    criticalIssues: randomItems(
      mockResponses.criticalIssues,
      2
    ),

    performanceInsights: randomItems(
      mockResponses.performanceInsights,
      3
    ),

    securityInsights: randomItems(
      mockResponses.securityInsights,
      2
    ),

    recommendations: randomItems(
      mockResponses.recommendations,
      2
    ),

    predictions: randomItems(
      mockResponses.predictions,
      2
    ),
  };
};

export const generateAiInsights = async (
  prompt
) => {
  const start = Date.now();

  try {
    logger.info({
      event: "ollama_request_started",
      model: MODEL,
    });

    const response = await axios.post(
      OLLAMA_URL,
      {
        model: MODEL,
        prompt,
        stream: false,
        format: "json",
      },
      {
        timeout: REQUEST_TIMEOUT,
      }
    );

    const latency = Date.now() - start;

    logger.info({
      event: "ollama_response_received",
      latency,
    });

    if (!response?.data?.response) {
      throw new Error(
        "Invalid Ollama response"
      );
    }

    let parsedData;

    try {
      parsedData = JSON.parse(
        response.data.response
      );
    } catch (parseError) {
      logger.error({
        event: "ollama_json_parse_failed",
        error: parseError.message,
      });

      throw new Error(
        "Failed to parse Ollama JSON"
      );
    }

    return {
      success: true,
      source: "ollama",
      latency,
      data: parsedData,
      raw: response.data.response,
    };
  } catch (error) {
    const latency = Date.now() - start;

    logger.warn({
      event: "ollama_fallback_triggered",
      latency,
      error: error.message,
    });

    const mockData = generateMockData();

    return {
      success: true,
      source: "mock-fallback",
      latency,
      data: mockData,
      raw: JSON.stringify(mockData),
      warning:
        "AI service unavailable. Using intelligent fallback mode.",
    };
  }
};