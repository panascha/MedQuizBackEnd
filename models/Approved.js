const mongoose = require('mongoose');

const ApprovedSchema = new mongoose.Schema({
    admin:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },   
    quiz:{
        type: mongoose.Schema.ObjectId,
        ref: "Quiz"
    },
    report:{
        type: mongoose.Schema.ObjectId,
        ref: "Report"
    },
    keyword:{
        type: mongoose.Schema.ObjectId,
        ref: "Keyword"
    },
    type: {
        type: String,
        enum: ['quiz', 'report', 'keyword'],
        required: true
    },
    Approved: {
        type: Boolean,
        require: true
    }
}, { timestamps: true });

ApprovedSchema.index({ admin: 1, quiz: 1, type: 'quiz' }, { unique: true, sparse: true });
ApprovedSchema.index({ admin: 1, report: 1, type: 'report' }, { unique: true, sparse: true });
ApprovedSchema.index({ admin: 1, keyword: 1, type: 'keyword' }, { unique: true, sparse: true });

module.exports = mongoose.model('Approved', ApprovedSchema);

