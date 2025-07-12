
const mongoose = require('mongoose');
const config = require('../config');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    trim: true,
    maxlength: [config.answerContentMaxLength, `Answer content cannot exceed ${config.answerContentMaxLength} characters`]
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question reference is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Answer author is required']
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
  isAccepted: {
    type: Boolean,
    default: false
  },
  comments: [{
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
answerSchema.index({ question: 1 });
answerSchema.index({ author: 1 });
answerSchema.index({ createdAt: -1 });
answerSchema.index({ isAccepted: 1 });
answerSchema.index({ isDeleted: 1 });

// Virtual for vote count
answerSchema.virtual('voteCount').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Virtual for total votes
answerSchema.virtual('totalVotes').get(function() {
  return this.votes.upvotes.length + this.votes.downvotes.length;
});

// Virtual for comment count
answerSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Check if user has voted
answerSchema.methods.hasUserVoted = function(userId) {
  if (this.votes.upvotes.includes(userId)) {
    return 'upvote';
  } else if (this.votes.downvotes.includes(userId)) {
    return 'downvote';
  }
  return null;
};

// Add vote to answer
answerSchema.methods.addVote = function(userId, voteType) {
  // Remove existing votes from this user
  this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
  this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
  
  // Add new vote
  if (voteType === 'upvote') {
    this.votes.upvotes.push(userId);
  } else if (voteType === 'downvote') {
    this.votes.downvotes.push(userId);
  }
  
  return this.save();
};

// Add comment to answer
answerSchema.methods.addComment = function(content, authorId) {
  this.comments.push({
    content,
    author: authorId,
    createdAt: new Date()
  });
  return this.save();
};

// Remove comment from answer
answerSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => !comment._id.equals(commentId));
  return this.save();
};

// Accept answer
answerSchema.methods.accept = function() {
  this.isAccepted = true;
  return this.save();
};

// Unaccept answer
answerSchema.methods.unaccept = function() {
  this.isAccepted = false;
  return this.save();
};

// Soft delete answer
answerSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Restore answer
answerSchema.methods.restore = function() {
  this.isDeleted = false;
  return this.save();
};

// Update answer content
answerSchema.methods.updateContent = function(newContent) {
  this.content = newContent;
  return this.save();
};

// Ensure virtual fields are serialized
answerSchema.set('toJSON', {
  virtuals: true
});

// Pre-save middleware to update question's last activity
answerSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Increment answer count on question
    const Question = mongoose.model('Question');
    await Question.findByIdAndUpdate(this.question, { $inc: { answerCount: 1 } });
  }
  next();
});

// Pre-remove middleware to decrement answer count
answerSchema.pre('remove', async function(next) {
  const Question = mongoose.model('Question');
  await Question.findByIdAndUpdate(this.question, { $inc: { answerCount: -1 } });
  next();
});

module.exports = mongoose.model('Answer', answerSchema);
