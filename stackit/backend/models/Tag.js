const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [2, 'Tag name must be at least 2 characters'],
    maxlength: [20, 'Tag name cannot exceed 20 characters'],
    match: [/^[a-z0-9-]+$/, 'Tag name can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Tag description cannot exceed 500 characters'],
    default: ''
  },
  color: {
    type: String,
    default: '#3b82f6', // Default blue color
    match: [/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color']
  },
  questionCount: {
    type: Number,
    default: 0
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
tagSchema.index({ name: 1 });
tagSchema.index({ questionCount: -1 });
tagSchema.index({ isOfficial: 1 });
tagSchema.index({ isDeleted: 1 });

// Virtual for tag URL
tagSchema.virtual('url').get(function() {
  return `/tags/${this.name}`;
});

// Increment question count
tagSchema.methods.incrementQuestionCount = function() {
  this.questionCount += 1;
  return this.save();
};

// Decrement question count
tagSchema.methods.decrementQuestionCount = function() {
  if (this.questionCount > 0) {
    this.questionCount -= 1;
  }
  return this.save();
};

// Soft delete tag
tagSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Restore tag
tagSchema.methods.restore = function() {
  this.isDeleted = false;
  return this.save();
};

// Update tag description
tagSchema.methods.updateDescription = function(description) {
  this.description = description;
  return this.save();
};

// Update tag color
tagSchema.methods.updateColor = function(color) {
  this.color = color;
  return this.save();
};

// Make tag official
tagSchema.methods.makeOfficial = function() {
  this.isOfficial = true;
  return this.save();
};

// Make tag unofficial
tagSchema.methods.makeUnofficial = function() {
  this.isOfficial = false;
  return this.save();
};

// Ensure virtual fields are serialized
tagSchema.set('toJSON', {
  virtuals: true
});

// Pre-save middleware to ensure lowercase name
tagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.name = this.name.toLowerCase();
  }
  next();
});

// Static method to find or create tag
tagSchema.statics.findOrCreate = async function(tagName, userId = null) {
  let tag = await this.findOne({ name: tagName.toLowerCase(), isDeleted: false });
  
  if (!tag) {
    tag = new this({
      name: tagName.toLowerCase(),
      createdBy: userId
    });
    await tag.save();
  }
  
  return tag;
};

// Static method to get popular tags
tagSchema.statics.getPopularTags = function(limit = 10) {
  return this.find({ isDeleted: false })
    .sort({ questionCount: -1 })
    .limit(limit)
    .select('name description questionCount color');
};

// Static method to search tags
tagSchema.statics.searchTags = function(query, limit = 10) {
  return this.find({
    name: { $regex: query, $options: 'i' },
    isDeleted: false
  })
    .sort({ questionCount: -1 })
    .limit(limit)
    .select('name description questionCount color');
};

module.exports = mongoose.model('Tag', tagSchema); 