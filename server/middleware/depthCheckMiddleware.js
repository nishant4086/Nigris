const MAX_DEPTH = 3;

function getDepth(obj) {
  if (typeof obj !== "object" || obj === null) {
    return 0;
  }
  let maxDepth = 0;
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      maxDepth = Math.max(maxDepth, getDepth(obj[key]));
    }
  }
  return maxDepth + 1;
}

// Routes with legitimately deep payloads (e.g. WebAuthn attestations)
const DEPTH_CHECK_EXEMPT = [
  "/api/auth/passkey/",
];

const depthCheckMiddleware = (req, res, next) => {
  if (DEPTH_CHECK_EXEMPT.some((p) => req.path.startsWith(p))) {
    return next();
  }
  if (req.body) {
    const depth = getDepth(req.body);
    if (depth > MAX_DEPTH) {
      return res.status(400).json({ error: `Payload exceeds maximum allowed depth of ${MAX_DEPTH} levels.` });
    }
  }
  next();
};

export default depthCheckMiddleware;
