const mongoose = require('mongoose');

// Subdocument schema for individual questions
const QuestionSchema = new mongoose.Schema({
    Quiz: {
        type: mongoose.Schema.ObjectId,
        ref: "Quiz",
        required: [true, 'Quiz reference is required']
    },
    Answer: {
        type: String,
        required: [true, 'Answer is required'],
        trim: true
    },
    isCorrect: {
        type: Boolean,
        required: [true, 'Correctness status is required']
    }
}, { _id: false });

const ScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    Subject: {
        type: mongoose.Schema.ObjectId,
        ref: "Subject",
        required: [true, 'Subject reference is required']
    },
    Category: {
        type: [mongoose.Schema.ObjectId],
        ref: "Category",
        required: [true, 'At least one category is required'],
        validate: {
            validator: function(categories) {
                return categories.length > 0;
            },
            message: 'At least one category must be specified'
        }
    },
    Score: {
        type: Number,
        required: [true, 'Score is required'],
        min: [0, 'Score cannot be negative'],
        validate: {
            validator: function(score) {
                return score <= this.FullScore;
            },
            message: 'Score cannot be greater than full score'
        }
    },
    FullScore: {
        type: Number,
        required: [true, 'Full score is required'],
        min: [1, 'Full score must be at least 1']
    },
    Question: {
        type: [QuestionSchema],
        required: [true, 'Questions are required'],
        validate: {
            validator: function(questions) {
                return questions.length > 0;
            },
            message: 'At least one question must be specified'
        }
    },
    timeTaken: {
        type: Number,
        required: [true, 'Time taken is required'],
        min: [0, 'Time taken cannot be negative']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
ScoreSchema.index({ user: 1, Subject: 1 });
ScoreSchema.index({ user: 1, createdAt: -1 });

// Validate that the number of questions matches the full score
ScoreSchema.pre('save', function(next) {
    if (this.Question.length !== this.FullScore) {
        next(new Error('Number of questions must match the full score'));
    }
    next();
});

module.exports = mongoose.model('Score', ScoreSchema);
