const Tag = require('../models/Tag');
const Question = require('../models/Question');
const { validationResult } = require('express-validator');

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
const getTags = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = config.defaultPageSize,
      sort = 'popular',
      search
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { isDeleted: false };

    // Search functionality
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { questionCount: -1, name: 1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { questionCount: -1, name: 1 };
    }

    const tags = await Tag.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tag.countDocuments(query);

    res.json({
      success: true,
      data: {
        tags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single tag
// @route   GET /api/tags/:id
// @access  Public
const getTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag || tag.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Get questions with this tag
    const questions = await Question.find({
      tags: tag._id,
      isDeleted: false
    })
      .populate('author', 'username reputation avatar')
      .populate('tags', 'name color')
      .sort({ lastActivity: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        tag,
        questions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new tag
// @route   POST /api/tags
// @access  Private
const createTag = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, color } = req.body;

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.toLowerCase() });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag already exists'
      });
    }

    const tag = await Tag.create({
      name: name.toLowerCase(),
      description,
      color,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: {
        tag
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Private
const updateTag = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { description, color } = req.body;

    const tag = await Tag.findById(req.params.id);
    if (!tag || tag.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check permissions (only creator or admin can edit)
    if (tag.createdBy && tag.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit tags you created'
      });
    }

    const updatedTag = await Tag.findByIdAndUpdate(
      req.params.id,
      { description, color },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: {
        tag: updatedTag
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Private
const deleteTag = async (req, res, next) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag || tag.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check permissions (only creator or admin can delete)
    if (tag.createdBy && tag.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete tags you created'
      });
    }

    // Check if tag is being used
    const questionCount = await Question.countDocuments({ tags: tag._id, isDeleted: false });
    if (questionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete tag. It is being used by ${questionCount} questions.`
      });
    }

    // Soft delete tag
    await tag.softDelete();

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular tags
// @route   GET /api/tags/popular
// @access  Public
const getPopularTags = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const tags = await Tag.getPopularTags(parseInt(limit));

    res.json({
      success: true,
      data: {
        tags
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search tags
// @route   GET /api/tags/search
// @access  Public
const searchTags = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const tags = await Tag.searchTags(q, parseInt(limit));

    res.json({
      success: true,
      data: {
        tags
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Make tag official
// @route   PUT /api/tags/:id/official
// @access  Private
const makeTagOfficial = async (req, res, next) => {
  try {
    const { isOfficial } = req.body;

    const tag = await Tag.findById(req.params.id);
    if (!tag || tag.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Only admins can make tags official
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can make tags official'
      });
    }

    if (isOfficial) {
      await tag.makeOfficial();
    } else {
      await tag.makeUnofficial();
    }

    res.json({
      success: true,
      message: `Tag ${isOfficial ? 'made official' : 'made unofficial'} successfully`,
      data: {
        isOfficial: tag.isOfficial
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags,
  searchTags,
  makeTagOfficial
};
