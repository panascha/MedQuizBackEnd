const Quiz = require('../models/Quiz');
const Keyword = require('../models/Keyword');
const Report = require('../models/Report');

exports.getReports = async (req, res, next) => {
    try {
        const report = await Report.find()
            .populate({path: "originalQuiz"})
            .populate({path: "suggestedChanges"})
            .populate({path: "originalKeyword"})
            .populate({path: "suggestedChangesKeyword"});
        res.status(200).json({ success: true, count: report.length, data: report });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
}

exports.getReport = async (req, res, next) => {
    const reportID = req.params.id;
    if(!reportID){
        return res.status(404).json({success: false, message: "Cannot get report by this Report ID"})
    }
    try {
        const report = await Report.findById(reportID)
            .populate({path: "originalQuiz"})
            .populate({path: "suggestedChanges"})
            .populate({path: "originalKeyword"})
            .populate({path: "suggestedChangesKeyword"});

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

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
};