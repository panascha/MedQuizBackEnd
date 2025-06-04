const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    User:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },   
    originalQuiz:{
        type: mongoose.Schema.ObjectId,
        ref: "Quiz",
        required: true
    },
    suggestedChanges:{
        type: mongoose.Schema.ObjectId,
        ref: "Quiz",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        require: true
    },
    approvedAdmin: {
        type: [mongoose.Schema.ObjectId],
        ref: "User",
    },
    reason:{
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ApprovedSchema.index({ admin: 1, quiz: 1 }, { unique: true }); // prevent duplicate approvals

module.exports = mongoose.model('Report', ReportSchema);