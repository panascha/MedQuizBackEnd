const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    minlength: [2, 'Subject name must be at least 2 characters'],
    maxlength: [100, 'Subject name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  img: {
    type: String,
    required: [true, 'Image is required'],
    match: [
      /^(\/public\/subjects\/|\/api\/v1\/images\/).+$/,
      'Image path must be in the subjects directory or be an API image URL'
    ]
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1, 'Year must be between 1 and 6'],
    max: [6, 'Year must be between 1 and 6']
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
subjectSchema.index({ name: 1 }, { unique: true });
subjectSchema.index({ year: 1 });

// Virtual for categories
subjectSchema.virtual('Category', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'subject',
  justOne: false
});

// Prevent duplicate subject names
subjectSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existingSubject = await this.constructor.findOne({ 
      name: this.name,
      _id: { $ne: this._id }
    });
    if (existingSubject) {
      next(new Error('Subject name already exists'));
    }
  }
  next();
});

module.exports = mongoose.model('Subject', subjectSchema);
