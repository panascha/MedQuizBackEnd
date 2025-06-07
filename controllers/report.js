const Report = require('../models/Report');

exports.getReports = async (req, res, next) => {
    try {
        const report = await Report.find()
            .populate({path: "originalQuiz"})
            .populate({path: "suggestedChanges"});
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
            .populate({path: "suggestedChanges"});

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
        const report = await Report.find({user:req.params.UserID})
            .populate({path: "originalQuiz"})
            .populate({path: "suggestedChanges"});
        if(!report) return res.status(400).json({ success: false })
        res.status(200).json({ success:true, data: report });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
}

exports.getReportByQuizID = async (req,res,next) => {
    try {
        const report = await Report.find({user:req.params.quizID})
            .populate({path: "originalQuiz"})
            .populate({path: "suggestedChanges"});
        if(!report) return res.status(400).json({ success: false })
        res.status(200).json({ success:true, data: report });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
}

exports.createReport  = async (req, res, next) => {
    try {
        const report = await Report.create(req.body);
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
}

exports.updateReport = async (req, res, next) => {
    try {

        const report = await Report.findById({report: req.params.id});

        if (!report) {
            return res.status(400).json({ success: false, message: `there is no report id ${req.params.id}`});
        }

        res.status(200).json({ success: true, data: report });
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