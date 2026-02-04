const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ===== ENSURE UPLOAD DIRECTORY EXISTS ===== */
const uploadDir = path.join(__dirname, "../uploads/products");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===== STORAGE CONFIG ===== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .toLowerCase();

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

/* ===== FILE FILTER ===== */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isMimeOk = allowedTypes.test(file.mimetype);
  const isExtOk = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (isMimeOk && isExtOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, png, webp)"));
  }
};

/* ===== MULTER INSTANCE ===== */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

module.exports = upload;
