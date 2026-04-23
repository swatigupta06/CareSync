const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ─── Storage Configuration ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'records';

    // Route-based sub-folder routing
    if (req.baseUrl.includes('lab') || req.path.includes('lab')) {
      folder = 'reports';
    } else if (req.path.includes('avatar') || req.path.includes('profile')) {
      folder = 'avatars';
    }

    const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', folder);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    // <userId>-<timestamp>-<sanitised-original-name>
    const userId = req.user ? req.user._id : 'anon';
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_').slice(0, 50);
    const timestamp = Date.now();
    cb(null, `${userId}-${timestamp}-${base}${ext}`);
  },
});

// ─── File filter — PDF and images only ────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only PDF and images (JPEG, PNG, GIF, WEBP) are allowed.'),
      false
    );
  }
};

// ─── Multer instances ──────────────────────────────────────────────────────
const maxSize = (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024;

/** Single file upload: field name = "file" */
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
}).single('file');

/** Multiple files upload: field name = "files", max 5 */
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
}).array('files', 5);

/** Wrap multer middleware to forward its errors to Express error handler */
const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

/**
 * Build a publicly-accessible URL for an uploaded file.
 * req is used to construct the base URL.
 */
const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  // Normalise to forward slashes and strip leading "./"
  const normalised = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
  return `${req.protocol}://${req.get('host')}/${normalised}`;
};

module.exports = {
  uploadSingle: handleUpload(uploadSingle),
  uploadMultiple: handleUpload(uploadMultiple),
  getFileUrl,
};
