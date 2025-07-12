const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification recipient is required']
  },
  type: {
    type: String,
    enum: [
      'question_answered',
      'answer_voted',
      'question_voted',
      'answer_accepted',
      'comment_added',
      'user_mentioned',
      'admin_action',
      'system_message'
    ],
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Notification title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Notification message cannot exceed 1000 characters']
  },
  data: {
    // Flexible data object for additional information
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer'
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote']
    },
    action: {
      type: String
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isDeleted: 1 });

// Virtual for notification URL
notificationSchema.virtual('url').get(function() {
  switch (this.type) {
    case 'question_answered':
    case 'question_voted':
      return this.data.questionId ? `/questions/${this.data.questionId}` : null;
    case 'answer_voted':
    case 'answer_accepted':
      return this.data.questionId ? `/questions/${this.data.questionId}#answer-${this.data.answerId}` : null;
    case 'comment_added':
      return this.data.questionId ? `/questions/${this.data.questionId}` : null;
    case 'user_mentioned':
      return this.data.userId ? `/users/${this.data.userId}` : null;
    default:
      return null;
  }
});

// Mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Mark notification as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  return this.save();
};

// Soft delete notification
notificationSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Restore notification
notificationSchema.methods.restore = function() {
  this.isDeleted = false;
  return this.save();
};

// Update notification data
notificationSchema.methods.updateData = function(newData) {
  this.data = { ...this.data, ...newData };
  return this.save();
};

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', {
  virtuals: true
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(recipientId, type, title, message, data = {}) {
  const notification = new this({
    recipient: recipientId,
    type,
    title,
    message,
    data
  });
  
  return await notification.save();
};

// Static method to get user notifications
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type = null
  } = options;
  
  const skip = (page - 1) * limit;
  const query = {
    recipient: userId,
    isDeleted: false
  };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('data.questionId', 'title')
    .populate('data.answerId', 'content')
    .populate('data.userId', 'username');
};

// Static method to mark all notifications as read
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false, isDeleted: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isDeleted: false
  });
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
