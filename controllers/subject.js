const Subject = require('../models/Subject')
const Category = require('../models/Category')
const Quiz = require('../models/Quiz')
const Image = require('../models/Image')
const Keyword = require('../models/Keyword')
const Score = require('../models/Score')
const Report = require('../models/Report')
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { deleteOldImage, deleteImagesBySubjectId } = require('../utils/imageUtils');

exports.getSubjects = async (req, res, next) => {
    try {
        const subject = await Subject.find()
            .populate({
                path: "Category", 
                select: "category description"
            });
        res.status(200).json({ success: true, count: subject.length, data: subject });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.getSubject= async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate({
                path: "Category", 
                select: "category description"
            });
        if (!subject) return res.status(404).json({ success: false, message: "there is no ID of this subject" });

        res.status(200).json({ success: true, data: subject });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.createSubject = async (req, res, next) => {
    try {
      if (req.user.role !== 'S-admin') {
        return res.status(403).json({
          success: false,
          message: "You have no permission to create Subject",
        });
      }
  
      const { name, description, year, img } = req.body;
      const NYear = Number(year);
      let imgPath = '';
      if (img) {
        imgPath = img;
      } else {
        return res.status(400).json({ success: false, message: "Image is required" });
      }
  
      const subject = await Subject.create({
        name,
        description,
        year: NYear,
        img: imgPath,
      });
  
      res.status(201).json({ success: true, data: subject });
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, error: error.message });
    }
  };
  

  exports.updateSubject = async (req, res, next) => {
    try {
      if (req.user.role !== 'S-admin') {
        return res.status(403).json({ success: false, message: "You have no permission to update this subject" });
      }

      // Get the existing subject to access the old image path
      const existingSubject = await Subject.findById(req.params.id);
      if (!existingSubject) {
        return res.status(404).json({ success: false, message: "Subject not found" });
      }
  
      const updateData = {
        name: req.body.name,
        description: req.body.description,
        year: req.body.year
      };
  
      // If a new image is provided, delete the old image and update the path
      if (req.body.img) {
        // Delete old image if it exists and is different from the new one
        if (existingSubject.img && existingSubject.img !== req.body.img) {
          await deleteOldImage(existingSubject.img);
        }
        updateData.img = req.body.img;
      }
  
      const subject = await Subject.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });
  
      res.status(200).json({ success: true, data: subject });
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, error: error.message });
    }
  };
  

exports.deleteSubject = async (req, res, next) => {
    try {
        if (req.user.role !== 'S-admin') {
            return res.status(403).json({ success: false, message: "You have no permission to delete this subject" });
        }

        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(400).json({ success: false });
        }

        await Category.deleteMany({ subject: req.params.id });
        await Quiz.deleteMany({ subject: req.params.id });
        await Keyword.deleteMany({ subject: req.params.id });
        await Score.deleteMany({ subject: req.params.id });
        await Report.deleteMany({ subject: req.params.id });
        
        // Delete all images associated with this subject
        await deleteImagesBySubjectId(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
};