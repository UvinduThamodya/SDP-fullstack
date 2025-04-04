const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

// Ensure upload directories exist
const ensureDirectories = async () => {
  const dirs = [
    path.join(__dirname, '../../public/uploads/original'),
    path.join(__dirname, '../../public/uploads/optimized')
  ];
  
  for (const dir of dirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureDirectories();
    cb(null, path.join(__dirname, '../../public/uploads/original'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

// Image optimization function
const optimizeImage = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .resize(800, 600, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    console.error('Image optimization error:', error);
    throw error;
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to handle image upload and optimization
const handleImageUpload = async (req, res, next) => {
  try {
    // If no file is uploaded, continue to next middleware
    if (!req.file) {
      return next();
    }

    const originalPath = req.file.path;
    const filename = `${path.parse(req.file.filename).name}.webp`;
    const optimizedPath = path.join(
      __dirname, 
      '../../public/uploads/optimized', 
      filename
    );

    // Optimize image
    await optimizeImage(originalPath, optimizedPath);

    // Set file path for database storage
    req.optimizedImagePath = `/uploads/optimized/${filename}`;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  handleImageUpload
};