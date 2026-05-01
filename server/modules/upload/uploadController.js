import path from "path";
import cloudinary from "../../config/cloudinary.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "../../middleware/uploadMiddleware.js";

/**
 * Upload a single file to Cloudinary.
 * POST /api/upload
 * Body: multipart/form-data with field name "file"
 */
export const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const isImage = ALLOWED_IMAGE_TYPES.includes(ext);
  const resourceType = isImage ? "image" : "video";

  // Per-type size enforcement
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (req.file.size > maxSize) {
    const limitMB = Math.round(maxSize / (1024 * 1024));
    return res.status(413).json({
      error: `File too large. Max ${resourceType} size is ${limitMB}MB.`,
    });
  }

  // Upload buffer to Cloudinary via stream
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "nigris",
        // Auto-optimize images
        ...(isImage && {
          transformation: [
            { quality: "auto", fetch_format: "auto" },
          ],
        }),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(req.file.buffer);
  });

  res.json({
    url: result.secure_url,
    public_id: result.public_id,
    type: resourceType,
    format: result.format,
    size: result.bytes,
    width: result.width || null,
    height: result.height || null,
  });
});
