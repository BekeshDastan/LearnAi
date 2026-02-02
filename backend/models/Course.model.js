const mongoose = require('mongoose');


const CourseSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },

  topicRequest: {
    type: String,
    required: true,
    maxlength: 2000
  },

  slug: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
  },

  coverImage: {
    type: String
  },

  estimatedDurationMinutes: {
    type: Number,
    min: 0
  },

  status: {
    type: String,
    enum: ['draft', 'generating', 'active', 'completed'],
    default: 'draft'
  },

  initialPlan: {
    type: [String],
    validate: {
      validator: v => Array.isArray(v) ? v.length <= 50 : true,
      message: 'initialPlan can have at most 50 items'
    }
  },

  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],

  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true 
});

CourseSchema.index({ user: 1, createdAt: -1 });
CourseSchema.index({ title: 'text', topicRequest: 'text' });

CourseSchema.pre('remove', async function(next) {
  await mongoose.model('Chapter').deleteMany({ course: this._id });
  next();
});

CourseSchema.virtual('computedProgress').get(function() {
  if (!this.chapters || !this.chapters.length) return 0;
  const done = this.chapters.filter(c => c.isCompleted).length;
  return Math.round((done / this.chapters.length) * 100);
});

module.exports = mongoose.model('Course', CourseSchema);