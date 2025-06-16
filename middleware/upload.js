const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Base directory for uploads
const baseDir = path.join(__dirname, '../public');

// Create base directories if they don't exist
const createDirIfNotExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Create main directories
createDirIfNotExists(path.join(baseDir, 'subjects'));
createDirIfNotExists(path.join(baseDir, 'quizzes'));

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG and GIF images are allowed.'), false);
    }
    cb(null, true);
};

// Storage configuration for subjects
const subjectStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subjectDir = path.join(baseDir, 'subjects');
        createDirIfNotExists(subjectDir);
        cb(null, subjectDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Storage configuration for quizzes
const quizStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get subject and category from request
        const subjectId = req.body.subject || 'default';
        const categoryId = req.body.category || 'default';
        
        // Create directory structure: quizzes/subjectId/categoryId
        const quizDir = path.join(baseDir, 'quizzes', subjectId, categoryId);
        createDirIfNotExists(quizDir);
        cb(null, quizDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer instances
const subjectUpload = multer({
    storage: subjectStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only one file for subjects
    }
});

const quizUpload = multer({
    storage: quizStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files for quizzes
    }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum is 5 files for quizzes, 1 for subjects'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next();
};

module.exports = { 
    subjectUpload, 
    quizUpload, 
    handleUploadError 
};
