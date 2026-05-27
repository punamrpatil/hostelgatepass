const multer = require('multer');
const path = require('path');

// ✅ memoryStorage — file is available as req.file.buffer (no disk folder needed)
const storage = multer.memoryStorage();

// Only allow Excel files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel spreadsheets (.xlsx, .xls) are permitted!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;