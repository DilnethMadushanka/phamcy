const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit per photo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'), false);
    }
  }
});

// Upload Prescriptions (Customer & Staff allowed)
router.post('/', authenticateToken, authorizeRoles('Customer', 'Admin', 'Pharmacist', 'Cashier'), upload.array('prescriptions', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const fileUrls = req.files.map(file => {
      // Use clean static URL `/uploads/filename.ext`
      return `/uploads/${file.filename}`;
    });

    res.status(200).json({
      message: 'Prescription images uploaded successfully',
      urls: fileUrls.length === 1 ? fileUrls[0] : fileUrls
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

module.exports = router;
