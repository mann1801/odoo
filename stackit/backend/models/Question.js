const mongoose = require('mongoose');
const config = require('../config');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
    maxlength: [config.questionTitleMaxLength, `Title cannot exceed ${config.questionTitleMaxLength} characters`]
  },
  description: {
    type: String,
    required: [true, 'Question description is required'],
    trim: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: [true, 'At least one tag is required']
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Question author is required']
  },
  views: {
    type: Number,
    default: 0
  },
  votes: {
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  answerCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
questionSchema.index({ title: 'text', description: 'text' });
questionSchema.index({ author: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ lastActivity: -1 });
questionSchema.index({ views: -1 });
questionSchema.index({ isDeleted: 1 });

// Virtual for vote count
questionSchema.virtual('voteCount').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Virtual for total votes
questionSchema.virtual('totalVotes').get(function() {
  return this.votes.upvotes.length + this.votes.downvotes.length;
});

// Check if user has voted
questionSchema.methods.hasUserVoted = function(userId) {
  if (this.votes.upvotes.includes(userId)) {
    return 'upvote';
  } else if (this.votes.downvotes.includes(userId)) {
    return 'downvote';
  }
  return null;
};

// Add vote to question
questionSchema.methods.addVote = function(userId, voteType) {
  // Remove existing votes from this user
  this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
  this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
  
  // Add new vote
  if (voteType === 'upvote') {
    this.votes.upvotes.push(userId);
  } else if (voteType === 'downvote') {
    this.votes.downvotes.push(userId);
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// Increment view count
questionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Update last activity
questionSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Soft delete question
questionSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Restore question
questionSchema.methods.restore = function() {
  this.isDeleted = false;
  return this.save();
};

// Accept answer
questionSchema.methods.acceptAnswer = function(answerId) {
  this.acceptedAnswer = answerId;
  this.lastActivity = new Date();
  return this.save();
};

// Close question
questionSchema.methods.closeQuestion = function() {
  this.isClosed = true;
  this.lastActivity = new Date();
  return this.save();
};

// Open question
questionSchema.methods.openQuestion = function() {
  this.isClosed = false;
  this.lastActivity = new Date();
  return this.save();
};

// Ensure virtual fields are serialized
questionSchema.set('toJSON', {
  virtuals: true
});

// Pre-save middleware to update last activity
questionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('Question', questionSchema);
