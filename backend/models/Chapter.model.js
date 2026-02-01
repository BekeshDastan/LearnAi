const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    default: '' 
  },

  quiz: [{
    question: String,
    options: [String], 
    correctAnswer: Number 
  }],

  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chapter', ChapterSchema);