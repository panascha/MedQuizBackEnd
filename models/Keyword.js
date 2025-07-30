const mongoose = require('mongoose');

const KeywordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    subject: {
        type: mongoose.Schema.ObjectId,
        ref: "Subject",
        required: function() { return !this.isGlobal; }
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: function() { return !this.isGlobal; }
    },
    keywords: {
        type: [String],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "reported"],
        default: "pending"
    },
    isGlobal: {
        type: Boolean,
    },
}, { timestamps: true });

module.exports = mongoose.model('Keyword', KeywordSchema);