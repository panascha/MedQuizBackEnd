const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, 'User ID is required']
    },
    question: {
        type: String,
        required: [true, 'Question is required'],
        trim: true,
        minlength: [5, 'Question must be at least 5 characters long'],
        maxlength: [1000, 'Question cannot be more than 1000 characters']
    },
    subject: {
        type: mongoose.Schema.ObjectId,
        ref: "Subject",
        required: [true, 'Subject is required']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: [true, 'Category is required']
    },
    type: {
        type: String,
        enum: {
            values: ["both", "choice", "written"],
            message: '{VALUE} is not a valid question type'
        },
        required: [true, 'Question type is required']
    },
    status: {
        type: String,
        enum: {
            values: ["pending", "approved", "rejected", "reported"],
            message: '{VALUE} is not a valid status'
        },
        default: "approved"
    },
    choice: {
        type: [String],
        validate: {
            validator: function(choices) {
                if (this.type === 'choice' || this.type === 'multi-choice') {
                    return choices && choices.length >= 2 && choices.length <= 6;
                }
                return true;
            },
            message: 'Choices must be between 2 and 6 for choice/multi-choice questions'
        }
    },
    correctAnswer: {
        type: [String],
        required: [true, 'Correct answer is required'],
        validate: {
            validator: function(answers) {
                if (this.type === 'choice') {
                    return answers.length === 1;
                }
                if (this.type === 'multi-choice') {
                    return answers.length >= 1 && answers.length <= 3;
                }
                return true;
            },
            message: 'Invalid number of correct answers for the question type'
        }
    },
    img: {
        type: [String],
        validate: {
            validator: function(images) {
                return images.every(img =>
                    /^\/public\/quizzes\/.+$/.test(img) ||
                    /^\/api\/v1\/images\/.+$/.test(img)
                ) && images.length <= 5;
            },
            message: 'Maximum 5 images allowed per question and must be valid image URLs'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add index for better query performance
QuizSchema.index({ subject: 1, category: 1, status: 1 });
QuizSchema.index({ user: 1, status: 1 });

// Validate that correct answers are among the choices for choice/multi-choice questions
QuizSchema.pre('save', function(next) {
    if (this.type === 'choice' || this.type === 'multi-choice') {
        const invalidAnswers = this.correctAnswer.filter(answer => 
            !this.choice.includes(answer)
        );
        if (invalidAnswers.length > 0) {
            next(new Error('Correct answers must be among the choices'));
        }
    }
    next();
});

module.exports = mongoose.model('Quiz', QuizSchema);