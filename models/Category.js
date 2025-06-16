const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject is required']
    },
    category: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        minlength: [2, 'Category name must be at least 2 characters'],
        maxlength: [100, 'Category name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add compound index for subject and category name
CategorySchema.index({ subject: 1, category: 1 }, { unique: true });

// Prevent duplicate category names within the same subject
CategorySchema.pre('save', async function(next) {
    if (this.isModified('category')) {
        const existingCategory = await this.constructor.findOne({
            subject: this.subject,
            category: this.category,
            _id: { $ne: this._id }
        });
        if (existingCategory) {
            next(new Error('Category name already exists for this subject'));
        }
    }
    next();
});

module.exports = mongoose.model('Category', CategorySchema);