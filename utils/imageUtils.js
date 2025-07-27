const Image = require('../models/Image');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

/**
 * Delete old images from database and GridFS
 * @param {string} imagePath - The image path/URL to delete
 */
const deleteOldImage = async (imagePath) => {
  try {
    if (imagePath.startsWith('/api/v1/images/')) {
      const imageId = imagePath.split('/').pop();
      const image = await Image.findById(imageId);
      
      if (image) {
        if (image.gridFsFilename) {
          const db = mongoose.connection.db;
          const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
          const files = await db.collection('uploads.files').find({ filename: image.gridFsFilename }).toArray();
          for (const file of files) {
            await bucket.delete(file._id);
          }
        }
        await Image.findByIdAndDelete(imageId);
      }
    }
  } catch (error) {
    console.error('Error deleting old image:', error);
  }
};

/**
 * Delete multiple images by subjectId from database and GridFS
 * @param {string} subjectId - The subject ID to find and delete images for
 */
const deleteImagesBySubjectId = async (subjectId) => {
  try {
    const images = await Image.find({ subjectId });
    if (images.length > 0) {
      const db = mongoose.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
      
      for (const image of images) {
        if (image.gridFsFilename) {
          const files = await db.collection('uploads.files').find({ filename: image.gridFsFilename }).toArray();
          for (const file of files) {
            await bucket.delete(file._id);
          }
        }
        await Image.findByIdAndDelete(image._id);
      }
    }
  } catch (error) {
    console.error('Error deleting images by subjectId:', error);
  }
};

module.exports = {
  deleteOldImage,
  deleteImagesBySubjectId
};
