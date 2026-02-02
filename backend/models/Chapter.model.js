const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  title: {
    type: String,
    required: true,
    maxlength: 300
  },

  content: {
    type: String,
    default: '',
    maxlength: 20000
  },

  quiz: [{
    question: { type: String, required: true, maxlength: 1000 },
    options: { type: [String], validate: { validator: v => Array.isArray(v) && v.length >= 2 && v.length <= 8, message: 'options must be an array of 2..8 strings' } },
    correctAnswer: { type: Number, required: true, validate: { validator: function(v) { return Array.isArray(this.options) ? v >= 0 && v < this.options.length : true; }, message: 'correctAnswer must be an index of options' } }
  }],

  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chapter', ChapterSchema);