import multer from "multer";
import path from "path";

const ALLOWED_IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const ALLOWED_VIDEO_TYPES = [".mp4", ".mov", ".avi", ".webm"];
const ALL_ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALL_ALLOWED.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type '${ext}'. Allowed: ${ALL_ALLOWED.join(", ")}`
      ),
      false
    );
  }
};

// We use the larger limit here; the controller does per-type enforcement
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE },
});

export { upload, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE };
