const mongoose = require('mongoose');
const Approved = require('../models/Approved');
const Quiz = require('../models/Quiz');
const Report = require('../models/Report');

exports.getApproveds = async (req, res, next) => {
    try {
        const approved = await Approved.find();
        if(approved.length <= 0) return res.status(404).json({ success: false, message: "there is no approved"});
        res.status(200).json({ success: true, count: approved.length, data: approved });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.getApproved= async (req, res, next) => {
    try {
        const approved = await Approved.findById(req.params.id);
        if (!approved) return res.status(404).json({ success: false, message: "there is no ID of this approved" });

        res.status(200).json({ success: true, data: approved });
    } 
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.createApproved = async (req, res, next) => {
    try {
        if(req.user.role !== 'admin' || req.user.role !== 'S-admin'){
            return res.status(403).json({ success: false, message: "You have no permission to create approved" });
        }

        const approved = await Approved.create(req.body);
        res.status(201).json({ success: true, data: approved });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
}

exports.updateApproved = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "You have no permission to update" });
        }

        const approved = await Approved.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!approved) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: approved });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteApproved= async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "You have no permission to delete" });
        }

        const approved = await Approved.findByIdAndDelete(req.params.id);

        if (!approved) {
            return res.status(400).json({ success: false, message: "there is no approved to delete"});
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.approvedQuiz = async (req, res) => {
    try {
      const { role, id: adminID } = req.user;
      const { quizID } = req.params;
      const { Approved: isApproved } = req.body; // Boolean: true = approve, false = deny
  
      if (!['admin', 'S-admin'].includes(role)) {
        return res.status(403).json({ success: false, message: "You have no permission to approve or deny quizzes" });
      }
  
      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({ success: false, message: "'Approved' field must be a boolean" });
      }
  
      if (!mongoose.Types.ObjectId.isValid(quizID)) {
        return res.status(400).json({ success: false, message: "Invalid quiz ID" });
      }
  
      const quiz = await Quiz.findById(quizID);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }
      if(quiz.status !== "pending"){
        return res.status(500).json({ success: false, message: "this quiz don't have to approved" });
      }
  
      // S-admin can approve directly
      if (role === 'S-admin') {
        if(isApproved) {
          const updatedQuiz = await Quiz.findByIdAndUpdate(quizID, { status: "approved" }, { new: true });
          await Approved.deleteMany({ quiz: quizID, type: 'quiz' }); // clear any previous approvals
          return res.status(200).json({
            success: true,
            message: "Quiz approved directly by S-admin",
            data: updatedQuiz
          });
        }
        else {
          await Quiz.findByIdAndDelete(quizID);
          await Approved.deleteMany({ quiz: quizID, type: 'quiz' });
          return res.status(200).json({
            success: true,
            message: "Quiz denied directly by S-admin"
          });
        }
      }
  
      // Save admin approval/denial
      await Approved.findOneAndUpdate(
        { admin: adminID, quiz: quizID, type: 'quiz' },
        { Approved: isApproved },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
  
      // Count approvals and denials
      const approvals = await Approved.countDocuments({ quiz: quizID, type: 'quiz', Approved: true });
      const denials = await Approved.countDocuments({ quiz: quizID, type: 'quiz', Approved: false });
  
      if (approvals >= 2) {
        const updatedQuiz = await Quiz.findByIdAndUpdate(quizID, { status: "approved" }, { new: true });
        await Approved.deleteMany({ quiz: quizID, type: 'quiz' });
        return res.status(200).json({
          success: true,
          message: "Quiz approved by 2 admins",
          data: updatedQuiz
        });
      }
  
      if (denials >= 2) {
        await Quiz.findByIdAndDelete(quizID);
        await Approved.deleteMany({ quiz: quizID, type: 'quiz' });
        return res.status(200).json({
          success: true,
          message: "Quiz denied and deleted by 2 admins"
        });
      }
  
      return res.status(200).json({
        success: true,
        message: `Your decision has been recorded. Waiting for more responses.`,
        approvals,
        denials
      });
  
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, error: error.message });
    }
};
  
exports.approvedReport = async (req, res) => {
    try {
      const { role, id: adminID } = req.user;
      const { reportID } = req.params;
      const { Approved: isApproved } = req.body; // Boolean: true = approve, false = deny
  
      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({ success: false, message: "'Approved' field must be a boolean" });
      }
  
      if (!mongoose.Types.ObjectId.isValid(reportID)) {
        return res.status(400).json({ success: false, message: "Invalid report ID" });
      }
  
      const report = await Report.findById(reportID)
        .populate('originalQuiz')
        .populate('suggestedChanges');
      
      if (!report) {
        return res.status(404).json({ success: false, message: "Report not found" });
      }
  
      // S-admin can approve directly
      if (role === 'S-admin') {
        if(isApproved){
          // Update suggest quiz status
          await Quiz.findByIdAndUpdate(
            report.suggestedChanges._id,
            {status: "approved"}
          );
        }
        else {
          // Update original quiz status
          await Quiz.findByIdAndUpdate(
            report.originalQuiz._id,
            {status: "approved"}
          );
        }
        // Update report status
        const updatedReport = await Report.findByIdAndUpdate(
          reportID,
          { status: 'approved' },
          { new: true }
        );
        await Approved.deleteMany({ report: reportID, type: 'report' });  
        return res.status(200).json({
          success: true,
          message: "Report approved directly by S-admin",
          data: updatedReport
        });
      }
  
      // Save admin approval/denial
      await Approved.findOneAndUpdate(
        { admin: adminID, report: reportID, type: 'report' },
        { Approved: isApproved, type: 'report' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
  
      // Count approvals and denials
      const approvals = await Approved.countDocuments({ report: reportID, type: 'report', Approved: true });
      const denials = await Approved.countDocuments({ report: reportID, type: 'report', Approved: false });
  
      if (approvals >= 2) {
        // Update suggest quiz status
        await Quiz.findByIdAndUpdate(
          report.suggestedChanges._id,
          {status: "approved"}
        );
        // Update report status
        const updatedReport = await Report.findByIdAndUpdate(
          reportID,
          { status: 'approved' },
          { new: true }
        );
        await Approved.deleteMany({ report: reportID, type: 'report' });
        return res.status(200).json({
          success: true,
          message: "Report approved by 2 admins",
          data: updatedReport
        });
      }
  
      if (denials >= 2) {
        // Update original quiz status
        await Quiz.findByIdAndUpdate(
          report.originalQuiz._id,
          {status: "approved"}
        );
        
        // Update report status
        await Report.findByIdAndUpdate(
          reportID,
          { status: 'rejected' },
          { new: true }
        );
        
        await Approved.deleteMany({ report: reportID, type: 'report' });
        
        return res.status(200).json({
          success: true,
          message: "Report rejected by 2 admins"
        });
      }
  
      return res.status(200).json({
        success: true,
        message: `Your decision has been recorded. Waiting for more responses.`,
        approvals,
        denials
      });
  
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, error: error.message });
    }
};
  