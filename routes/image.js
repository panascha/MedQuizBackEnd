const express = require('express');
const router = express.Router();
const { uploadMemory, uploadGridFS, hybridUploadHandler } = require('../middleware/hybridUpload');
const { protect } = require('../middleware/auth');
const { uploadImage, getImage, deleteImage } = require('../controllers/image');

// Hybrid upload: try memory first, then GridFS if file too large
router.post('/upload',
    protect,
    (req, res, next) => {
		const contentLength = req.headers['content-length']; // Size in bytes
		const fileSize = parseInt(contentLength, 10);
		const maxAllowedSize = 1 * 1024 * 1024;

		console.log(`Received file size: ${req.headers['content-length']}, ${fileSize} bytes, ${maxAllowedSize} max`);

		if (fileSize > maxAllowedSize) {
			uploadGridFS.single('image')(req, res, function (err) {
				if (err) return res.status(400).json({ success: false, message: err.message });
				next();
			});
		} else {
			uploadMemory.single('image')(req, res, function (err) {
			if (err) return res.status(400).json({ success: false, message: err.message });
			next();
		});
		}
    },
    hybridUploadHandler,
    uploadImage
);

// Get image by ID
router.get('/:id', getImage);

// Delete image
router.delete('/:id', protect, deleteImage);

module.exports = router; 
