const Image = require('../models/Image');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Upload image (hybrid)
exports.uploadImage = async (req, res) => {
    try {
        const img = req.hybridImage;
        if (!img) {
            return res.status(400).json({ success: false, message: 'No image data found.' });
        }
        let imageDoc;
        if (img.type === 'base64') {
            // Store as base64
            const base64Data = img.buffer.toString('base64');
            imageDoc = new Image({
                name: img.originalname,
                data: base64Data,
                contentType: img.mimetype,
                size: img.size,
                uploadedBy: req.user ? req.user.id : null,
                category: req.body.category || 'other',
                subjectId: req.body.subjectId || null,
                quizId: req.body.quizId || null
            });
        } else if (img.type === 'gridfs') {
            // Store GridFS filename
            imageDoc = new Image({
                name: img.originalname,
                gridFsFilename: img.filename,
                contentType: img.mimetype,
                size: img.size,
                uploadedBy: req.user ? req.user.id : null,
                category: req.body.category || 'other',
                subjectId: req.body.subjectId || null,
                quizId: req.body.quizId || null
            });
        } else {
            return res.status(400).json({ success: false, message: 'Unknown image type.' });
        }
        await imageDoc.save();
        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                id: imageDoc._id,
                name: imageDoc.name,
                type: img.type,
                url: `/api/v1/images/${imageDoc._id}`
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error uploading image', error: error.message });
    }
};

// Get image by ID (serves image data)
exports.getImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
        if (image.data) {
            // Base64 image
            const imgBuffer = Buffer.from(image.data, 'base64');
            res.set('Content-Type', image.contentType);
            res.send(imgBuffer);
        } else if (image.gridFsFilename) {
            // GridFS image
            const db = mongoose.connection.db;
            const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
            res.set('Content-Type', image.contentType);
            bucket.openDownloadStreamByName(image.gridFsFilename).pipe(res).on('error', () => {
                res.status(404).json({ success: false, message: 'File not found in GridFS' });
            });
        } else {
            res.status(404).json({ success: false, message: 'No image data found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving image', error: error.message });
    }
};

// Delete image
exports.deleteImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
        // Only allow owner or admin to delete
        if (req.user.role !== 'S-admin' && (!image.uploadedBy || image.uploadedBy.toString() !== req.user.id)) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this image' });
        }
        if (image.gridFsFilename) {
            // Delete from GridFS
            const db = mongoose.connection.db;
            const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
            const files = await db.collection('uploads.files').find({ filename: image.gridFsFilename }).toArray();
            for (const file of files) {
                await bucket.delete(file._id);
            }
        }
        await Image.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting image', error: error.message });
    }
}; 