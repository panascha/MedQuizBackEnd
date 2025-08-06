const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const path = require('path');

const memoryStorage = multer.memoryStorage();

const gridFsStorage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return {
            bucketName: 'uploads',
            filename: `${Date.now()}-${file.originalname}`,
            metadata: {
                uploadedBy: req.user ? req.user.id : null,
                category: req.body.category || 'other',
                subjectId: req.body.subjectId || null,
                quizId: req.body.quizId || null
            }
        };
    }
});

const uploadMemory = multer({
    storage: memoryStorage,
    limits: { fileSize: 1 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
        }
        cb(null, true);
    }
});

const uploadGridFS = multer({
    storage: gridFsStorage,
    limits: { fileSize: 50 * 1024 * 1024, files: 1 }, // Increased to 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
        }
        cb(null, true);
    }
});

const hybridUploadHandler = async (req, res, next) => {
    if (req.file && req.file.buffer && req.file.size <= 1 * 1024 * 1024) {
        req.hybridImage = {
            type: 'base64',
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        };
        return next();
    }
    // If file is uploaded via GridFS (large image)
    if (req.file && req.file.filename) {
        req.hybridImage = {
            type: 'gridfs',
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        };
        return next();
    }
    return res.status(400).json({ success: false, message: 'No file uploaded or file too large.' });
};

module.exports = { uploadMemory, uploadGridFS, hybridUploadHandler }; 