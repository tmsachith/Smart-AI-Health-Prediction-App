const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = 'health-reports';
    const allowedFormats = ['jpg', 'jpeg', 'png', 'pdf'];
    
    return {
      folder: folder,
      allowed_formats: allowedFormats,
      resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      public_id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transformation: file.mimetype !== 'application/pdf' ? [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: 'auto:good' }
      ] : undefined
    };
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get file details
const getFileDetails = (file) => {
  return {
    fileUrl: file.path || file.secure_url,
    cloudinaryPublicId: file.filename,
    fileName: file.originalname,
    fileType: file.mimetype.startsWith('image/') ? 'image' : 'pdf',
    fileSize: file.size,
    format: file.format
  };
};

module.exports = {
  cloudinary,
  upload,
  deleteFromCloudinary,
  getFileDetails
};
