const normalizeError = (err) => {
  const status =
    err.status ||
    err.statusCode ||
    (err.code === "LIMIT_FILE_SIZE" ? 413 : 500);

  // Never leak internal error details in production.
  let errorMessage;
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      errorMessage = "File too large. Please choose a smaller file.";
      break;
    default:
      errorMessage = err.message || "Internal Server Error";
  }

  // Common safety: unify validation-ish errors.
  if (err.name === "CastError") {
    errorMessage = "Invalid identifier";
  }

  if (err.name === "ValidationError") {
    errorMessage = "Request validation failed";
  }

  if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
    errorMessage = "Malformed JSON";
  }

  return { status, errorMessage };
};

const errorMiddleware = (err, req, res, next) => {
  const { status, errorMessage } = normalizeError(err);

  // Allow explicit safe messages (but still do not expose stack traces)
  // e.g. throw new AppError(400, "...") pattern.
  const traceId = req.headers["x-trace-id"] || req.id;

  const payload = {
    error: errorMessage,
    status,
    traceId: traceId || undefined,
  };

  // 🛡️ CRITICAL: Only leak stack/internal details if EXPLICITLY in development mode.
  // We use a strict check to avoid accidental leakage if NODE_ENV is unset or malformed.
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    payload.stack = err?.stack;
    payload.code = err?.code;
    payload.name = err?.name;
  }

  // Avoid leaking internal error messages from unknown errors in production.
  if (!isDev && (!payload.error || status >= 500)) {
    payload.error = "Internal Server Error";
  }

  // Scrub malformed JSON messages that might reveal internal parser details
  if (!isDev && payload.error.includes("SyntaxError")) {
    payload.error = "Malformed JSON";
  }


  // Avoid headers already sent.
  if (res.headersSent) return next(err);
  return res.status(status).json(payload);
};

export default errorMiddleware;

