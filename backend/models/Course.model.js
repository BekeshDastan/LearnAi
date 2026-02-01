const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },

  topicRequest: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['draft', 'generating', 'active', 'completed'],
    default: 'draft'
  },

  initialPlan: [{
    type: String
  }],

  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],

  progress: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Course', CourseSchema);