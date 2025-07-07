const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    data: { type: String }, // base64 string
    gridFsFilename: { type: String }, // GridFS filename
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadDate: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, enum: ['subject', 'quiz', 'profile', 'other'], default: 'other' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
});

module.exports = mongoose.model('Image', imageSchema); 