const Quiz = require('../models/Quiz');
const Keyword = require('../models/Keyword');
const Report = require('../models/Report');
const fs = require('fs');
const path = require('path');
const Image = require('../models/Image');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

exports.getReports = async (req, res, next) => {
    try {
        const { status } = req.query;
        
        const query = {};
        if (status) {
            query.status = status;
        }

        const report = await Report.find(query)
            .populate({
                path: "originalQuiz",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({
                path: "suggestedChanges",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({
                path: "originalKeyword",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({
                path: "suggestedChangesKeyword",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({path: "User", select: "name"});

        res.status(200).json({ success: true, count: report.length, data: report });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.getReport = async (req, res, next) => {
    const reportID = req.params.id;
    if(!reportID){
        return res.status(404).json({success: false, message: "Cannot get report by this Report ID"})
    }
    try {
        const report = await Report.findById(reportID)
            .populate({
                path: "originalQuiz",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({
                path: "suggestedChanges",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({
                path: "originalKeyword",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({
                path: "suggestedChangesKeyword",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            });

        if (!report) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
}

exports.getReportByUserID = async (req,res,next) => {
    try {
        const report = await Report.find({User: req.params.UserID})
            .populate({
                path: "originalQuiz",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({
                path: "suggestedChanges",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({
                path: "originalKeyword",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            })
            .populate({
                path: "suggestedChangesKeyword",
                populate: [
                    { path: "subject" },
                    { path: "category" }
                ]
            });
        if(!report) return res.status(400).json({ success: false })
        res.status(200).json({ success:true, data: report });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
}

exports.getReportByType = async (req, res, next) => {
    try {
        const { type } = req.params;
        if (!['quiz', 'keyword'].includes(type)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid report type. Must be 'quiz' or 'keyword'" 
            });
        }

        const report = await Report.find({ type })
            .populate({path: "originalQuiz"})
            .populate({path: "suggestedChanges"})
            .populate({path: "originalKeyword"})
            .populate({path: "suggestedChangesKeyword"});
            
        if(!report) return res.status(400).json({ success: false })
        res.status(200).json({ success:true, data: report });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
}

exports.createReport = async (req, res, next) => {
    try {
        const { type, originalQuiz, suggestedChanges, originalKeyword, suggestedChangesKeyword } = req.body;

        if (!type || !['quiz', 'keyword'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid report type. Must be 'quiz' or 'keyword'"
            });
        }

        if (type === 'quiz') {
            // Validate quiz report
            if (!originalQuiz || !suggestedChanges) {
                return res.status(400).json({
                    success: false,
                    message: "Both originalQuiz and suggestedChanges are required for quiz reports"
                });
            }

            const originalQuizDoc = await Quiz.findById(originalQuiz);
            const suggestedChangesDoc = await Quiz.findById(suggestedChanges);

            if (!originalQuizDoc || !suggestedChangesDoc) {
                return res.status(404).json({
                    success: false,
                    message: "One or both quizzes not found"
                });
            }

            // Update quiz statuses
            await Quiz.findByIdAndUpdate(originalQuiz, { status: "reported" });
            await Quiz.findByIdAndUpdate(suggestedChanges, { status: "reported" });

        } else if (type === 'keyword') {
            // Validate keyword report
            if (!originalKeyword || !suggestedChangesKeyword) {
                return res.status(400).json({
                    success: false,
                    message: "Both originalKeyword and suggestedChangesKeyword are required for keyword reports"
                });
            }

            const originalKeywordDoc = await Keyword.findById(originalKeyword);
            const suggestedChangesKeywordDoc = await Keyword.findById(suggestedChangesKeyword);

            if (!originalKeywordDoc || !suggestedChangesKeywordDoc) {
                return res.status(404).json({
                    success: false,
                    message: "One or both keywords not found"
                });
            }
            await Keyword.findByIdAndUpdate(originalKeyword, { status: "reported" });
            await Keyword.findByIdAndUpdate(suggestedChangesKeyword, { status: "reported" });
        }

        const report = await Report.create(req.body);
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.updateReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(400).json({ 
                success: false, 
                message: `there is no report id ${req.params.id}`
            });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedReport });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
};

exports.deleteReport = async (req, res, next) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);

        if (!report) {
            return res.status(400).json({ success: false });
        }
        const deleteQuizAndImages = async (quizId) => {
            const quiz = await Quiz.findByIdAndDelete(quizId);
            const images = await Image.find({ quizId });
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
        };
        const deleteKeywordAndImages = async (keywordId) => {
            const keyword = await Keyword.findByIdAndDelete(keywordId);
            const images = await Image.find({ keywordId });
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
        };
        if (report.type === 'quiz') {
            if (report.status === 'approved' && report.originalQuiz) {
                await deleteQuizAndImages(report.originalQuiz);
            } else if (report.status === 'rejected' && report.suggestedChanges) {
                await deleteQuizAndImages(report.suggestedChanges);
            }
        } else if (report.type === 'keyword') {
            if (report.status === 'approved' && report.originalKeyword) {
                await deleteKeywordAndImages(report.originalKeyword);
            } else if (report.status === 'rejected' && report.suggestedChangesKeyword) {
                await deleteKeywordAndImages(report.suggestedChangesKeyword);
            }
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
};