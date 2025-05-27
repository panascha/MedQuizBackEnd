const mongoose = require('mongoose');

// Subdocument schema for individual questions
const QuestionSchema = new mongoose.Schema({
    Quiz: {
        type: mongoose.Schema.ObjectId,
        ref: "Quiz",
        required: true,
    },
    Answer: {
        type: String,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        required: true,
    }
}, { _id: false }); // optional: no _id for each Question if not needed

const ScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // optional but recommended
        required: true,
    },
    Subject: {
        type: mongoose.Schema.ObjectId,
        ref: "Subject",
        required: true
    },
    Category: {
        type: [mongoose.Schema.ObjectId],
        ref: "Category",
        required: true
    },
    Score: {
        type: Number,
        required: true
    },
    FullScore: {
        type: Number,
        required: true,
    },
    Question: {
        type: [QuestionSchema], // use the schema object here
        required: true
    },
    timeTaken: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Score', ScoreSchema);
