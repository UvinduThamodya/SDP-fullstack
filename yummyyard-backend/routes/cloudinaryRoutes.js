const express = require('express');
const multer = require('multer');
const cloudinary = require('../services/cloudinary'); // path to your cloudinary.js
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json({ imageUrl: result.secure_url });
      }
    );
    result.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
