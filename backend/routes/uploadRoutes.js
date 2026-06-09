const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types whitelist
const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
  "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/aac",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter,
});

// @route POST /api/uploads
// @desc Upload a single file and return its URL
router.post("/", verifyToken, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Return both relative path and full URL
    const relativePath = `/uploads/${req.file.filename}`;
    const protocol = req.protocol;
    const host = req.get("host");
    const fullUrl = `${protocol}://${host}${relativePath}`;

    res.status(201).json({ 
      url: fullUrl,
      relativeUrl: relativePath,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server error during upload" });
  }
});

// @route DELETE /api/uploads/:filename
// @desc Delete an uploaded file (clean up orphaned files)
router.delete("/:filename", verifyToken, (req, res) => {
  try {
    const filename = path.basename(req.params.filename); // Prevent directory traversal
    const filePath = path.join(uploadDir, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "File deleted" });
  } catch (error) {
    console.error("Delete upload error:", error);
    res.status(500).json({ error: "Server error during file deletion" });
  }
});

// Handle multer file type errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("File type not allowed")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
