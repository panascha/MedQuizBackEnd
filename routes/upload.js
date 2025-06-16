const express = require('express');
const router = express.Router();
const { subjectUpload, quizUpload, handleUploadError } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

// Route for uploading subject image
router.post('/subject', 
    protect,
    authorize('S-admin'),
    subjectUpload.single('image'),
    handleUploadError,
    (req, res) => {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No file uploaded' 
            });
        }

        res.json({
            success: true,
            message: 'Subject image upload successful',
            filename: req.file.filename,
            path: `/public/subjects/${req.file.filename}`,
        });
    }
);

// Route for uploading quiz images
router.post('/quiz', 
    protect,
    authorize('user', 'S-admin', 'admin'),
    quizUpload.array('images', 5),
    handleUploadError,
    (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'No files uploaded' 
            });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            path: `/public/quizzes/${req.body.subject || 'default'}/${req.body.category || 'default'}/${file.filename}`
        }));

        res.json({
            success: true,
            message: 'Quiz images upload successful',
            files
        });
    }
);

module.exports = router;
