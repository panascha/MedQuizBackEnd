const express = require('express');
const router = express.Router();
const { uploadMemory, uploadGridFS, hybridUploadHandler } = require('../middleware/hybridUpload');
const { protect } = require('../middleware/auth');
const { uploadImage, getImage, deleteImage } = require('../controllers/image');

// Hybrid upload: try memory first, then GridFS if file too large
router.post('/upload',
    protect,
    (req, res, next) => {
        uploadMemory.single('image')(req, res, function (err) {
            if (err && err.code === 'LIMIT_FILE_SIZE') {
                // If too large for memory, try GridFS
                return uploadGridFS.single('image')(req, res, function (err2) {
                    if (err2) return res.status(400).json({ success: false, message: err2.message });
                    next();
                });
            } else if (err) {
                return res.status(400).json({ success: false, message: err.message });
            }
            next();
        });
    },
    hybridUploadHandler,
    uploadImage
);

// Get image by ID
router.get('/:id', getImage);

// Delete image
router.delete('/:id', protect, deleteImage);

module.exports = router; 