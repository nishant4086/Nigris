import axios from "axios";

const DEFAULT_BASE_URL = "http://localhost:8000/api/public";
const DEFAULT_TIMEOUT = 10000;

class NigrisError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "NigrisError";
    Object.assign(this, details);
  }
}

function formatAxiosError(error) {
  if (error.response) {
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Request failed with status ${error.response.status}`;

    return new NigrisError(message, {
      status: error.response.status,
      data: error.response.data,
      code: error.code,
      isAxiosError: true,
    });
  }

  if (error.request) {
    return new NigrisError("Network error: no response received from API", {
      code: error.code,
      isAxiosError: true,
    });
  }

  return new NigrisError(error.message || "Unexpected SDK error", {
    code: error.code,
    isAxiosError: true,
  });
}

export default class NigrisClient {
  constructor(apiKey, options = {}) {
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      throw new Error("An API key is required");
    }

    const baseURL = typeof options.baseURL === "string" && options.baseURL.trim()
      ? options.baseURL.trim()
      : DEFAULT_BASE_URL;
    const timeout = Number.isFinite(options.timeout) && options.timeout > 0
      ? options.timeout
      : DEFAULT_TIMEOUT;

    this.http = axios.create({
      baseURL,
      timeout,
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  async request(config) {
    try {
      const response = await this.http.request(config);
      return response.data;
    } catch (error) {
      throw formatAxiosError(error);
    }
  }
}

export { DEFAULT_BASE_URL, DEFAULT_TIMEOUT, NigrisError, formatAxiosError };