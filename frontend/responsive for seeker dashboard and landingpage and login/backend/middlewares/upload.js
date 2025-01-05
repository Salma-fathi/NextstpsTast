import multer from 'multer';
import path from 'path';

// Set up storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination directory for the files
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    // Use a unique name for each file to avoid overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to limit file types (e.g., images and PDF files)
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profileImage' && !file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed for profile images'), false);
  }
  if (file.fieldname === 'resume' && file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed for resume'), false);
  }
  cb(null, true);
};

// Initialize the upload middleware
const upload = multer({ storage, fileFilter });

export default upload;
