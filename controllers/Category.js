const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const Image = require('../models/Image');
const Keyword = require('../models/Keyword');
const Score = require('../models/Score');
const Report = require('../models/Report');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

exports.getCategories = async (req, res, next) => {
    try {
        const category = await Category.find().populate({path:"subject", select: "name"});
        res.status(200).json({ success: true, count: category.length, data: category });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.getCategoriesBySubject = async (req, res) => {
    try {
        const category = await Category.find({subject: req.params.subjectID}).populate("subject");
        res.status(200).json({ success: true, count: category.length, data: category });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.getCategory= async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: "there is no ID of this category" });
        res.status(200).json({ success: true, data: category });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.createCategory = async (req, res, next) => {
    try {
        if(req.user.role !== 'S-admin'){
            res.status(500).json({ success: false, message: "you have no permission to create Category"});
        }

        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.updateCategory = async (req, res, next) => {
    try {
        if (req.user.role !== 'S-admin') {
            return res.status(403).json({ success: false, message: "You have no permission to update this category" });
        }

        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!category) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        if (req.user.role !== 'S-admin') {
            return res.status(403).json({ success: false, message: "You have no permission to delete this category" });
        }

        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(400).json({ success: false });
        }

        await Quiz.deleteMany({ category: req.params.id });
        await Keyword.deleteMany({ category: req.params.id });
        await Score.deleteMany({ category: req.params.id });
        await Report.deleteMany({ category: req.params.id });
        const images = await Image.find({ category: req.params.id });
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

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
};