const mongoose = require('mongoose');

const KeywordSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    subject:{
        type: mongoose.Schema.ObjectId,
        ref: "Subject",
        require: true
    },
    category:{
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: true,
    },
    keywords:{
        type: [String],
        required: true,
    },
    status:{
        type: String,
        enum: ["pending", "approved", "rejected", "reported"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model('Keyword', KeywordSchema);