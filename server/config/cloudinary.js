import { v2 as cloudinary } from "cloudinary";

let configured = false;

const normalizeEnv = (value) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.replace(/^['"]|['"]$/g, "");
};

const parseCloudinaryUrl = (cloudinaryUrl) => {
  const normalized = normalizeEnv(cloudinaryUrl);
  if (!normalized) return null;
  // Expected format: cloudinary://api_key:api_secret@cloud_name
  const match = normalized.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i);
  if (!match) return null;
  const [, api_key, api_secret, cloud_name] = match;
  return { api_key, api_secret, cloud_name };
};

const isPlaceholderValue = (value) => {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return normalized === "root" || normalized.startsWith("your_");
};

const configureCloudinary = () => {
  // Prefer CLOUDINARY_URL if provided, because it contains a single consistent
  // set of credentials (API key/secret + cloud name).
  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  const cloudName = fromUrl
    ? fromUrl.cloud_name
    : normalizeEnv(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = fromUrl ? fromUrl.api_key : normalizeEnv(process.env.CLOUDINARY_API_KEY);
  const apiSecret = fromUrl
    ? fromUrl.api_secret
    : normalizeEnv(process.env.CLOUDINARY_API_SECRET);

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret ||
    isPlaceholderValue(cloudName) ||
    isPlaceholderValue(apiKey) ||
    isPlaceholderValue(apiSecret)
  ) {
    console.warn(
      "⚠ Cloudinary credentials missing. Media uploads will fail."
    );
    configured = false;
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
};

configureCloudinary();

export const isCloudinaryConfigured = () => configured;

export default cloudinary;
