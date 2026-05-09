import path from "path";
import cloudinary, { isCloudinaryConfigured } from "../../config/cloudinary.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_FILE_SIZE
} from "../../middleware/uploadMiddleware.js";

/**
 * Upload a single file to Cloudinary.
 * POST /api/upload
 * Body: multipart/form-data with field name "file"
 */
export const uploadMedia = asyncHandler(async (req, res) => {
  // Extra runtime guard: if a placeholder/invalid key sneaks in, Cloudinary will
  // throw errors like "Invalid api_key" or "Invalid Signature".
  const normalizeEnv = (value) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    return trimmed.replace(/^['"]|['"]$/g, "");
  };

  const currentCloudinaryConfig = cloudinary.config();
  const runtimeApiKey = normalizeEnv(currentCloudinaryConfig?.api_key);
  const runtimeCloudName = normalizeEnv(currentCloudinaryConfig?.cloud_name);
  const usingPlaceholderCredentials =
    !runtimeApiKey ||
    !runtimeCloudName ||
    runtimeApiKey.toLowerCase().startsWith("your_") ||
    runtimeCloudName.toLowerCase() === "root";

  if (!isCloudinaryConfigured() || usingPlaceholderCredentials) {
    return res.status(503).json({
      error:
        "Media uploads are not configured. Verify CLOUDINARY_* credentials in server/.env and restart backend.",
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const isImage = ALLOWED_IMAGE_TYPES.includes(ext);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(ext);

  let resourceType = "raw";
  let maxSize = MAX_FILE_SIZE;

  if (isImage) {
    resourceType = "image";
    maxSize = MAX_IMAGE_SIZE;
  } else if (isVideo) {
    resourceType = "video";
    maxSize = MAX_VIDEO_SIZE;
  }

  // Per-type size enforcement
  if (req.file.size > maxSize) {
    const limitMB = Math.round(maxSize / (1024 * 1024));
    return res.status(413).json({
      error: `File too large. Max ${resourceType} size is ${limitMB}MB.`,
    });
  }

  // Upload buffer to Cloudinary via stream
  let result;
  try {
    result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "nigris",
          // Auto-optimize images
          ...(isImage && {
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          }),
        },
        (error, uploadedResult) => {
          if (error) return reject(error);
          resolve(uploadedResult);
        }
      );

      stream.end(req.file.buffer);
    });
  } catch (error) {
    const message = typeof error?.message === "string" ? error.message : "";
    const lower = message.toLowerCase();

    if (lower.includes("invalid api_key")) {
      return res.status(503).json({
        error:
          "Cloudinary API key is invalid. Update CLOUDINARY_* values in server/.env and restart backend.",
      });
    }

    if (lower.includes("invalid signature") || lower.includes("signature")) {
      return res.status(503).json({
        error:
          "Cloudinary signature is invalid (API secret mismatch). Verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in server/.env and restart backend.",
      });
    }

    throw error;
  }

  res.json({
    url: result.secure_url,
    public_id: result.public_id,
    type: resourceType === "raw" ? "file" : resourceType,
    format: result.format || ext.replace(".", ""),
    size: result.bytes,
    width: result.width || null,
    height: result.height || null,
    name: req.file.originalname
  });
});
