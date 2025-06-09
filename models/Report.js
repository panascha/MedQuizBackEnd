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
    },
    suggestedChanges:{
        type: mongoose.Schema.ObjectId,
        ref: "Quiz",
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
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

module.exports = mongoose.model('Report', ReportSchema);