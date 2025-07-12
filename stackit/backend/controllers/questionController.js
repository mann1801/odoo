const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const config = require('../config');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = config.defaultPageSize,
      sort = 'newest',
      tag,
      search,
      author,
      answered
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { isDeleted: false };

    // Filter by tag
    if (tag) {
      const tagDoc = await Tag.findOne({ name: tag.toLowerCase() });
      if (tagDoc) {
        query.tags = tagDoc._id;
      }
    }

    // Filter by author
    if (author) {
      const authorDoc = await User.findOne({ username: author });
      if (authorDoc) {
        query.author = authorDoc._id;
      }
    }

    // Filter by answered status
    if (answered === 'true') {
      query.acceptedAnswer = { $exists: true, $ne: null };
    } else if (answered === 'false') {
      query.acceptedAnswer = { $exists: false };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'votes':
        sortOption = { voteCount: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      case 'activity':
        sortOption = { lastActivity: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username reputation avatar')
      .populate('tags', 'name color')
      .populate('acceptedAnswer', 'content')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      data: {
        questions,
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

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
const getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username reputation avatar bio')
      .populate('tags', 'name color description')
      .populate('acceptedAnswer', 'content author createdAt');

    if (!question || question.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Increment view count
    await question.incrementViews();

    // Get answers for this question
    const answers = await Answer.find({
      question: question._id,
      isDeleted: false
    })
      .populate('author', 'username reputation avatar')
      .sort({ isAccepted: -1, voteCount: -1, createdAt: 1 });

    res.json({
      success: true,
      data: {
        question,
        answers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private
const createQuestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, tags } = req.body;

    // Process tags
    const tagIds = [];
    for (const tagName of tags) {
      const tag = await Tag.findOrCreate(tagName, req.user._id);
      tagIds.push(tag._id);
    }

    const question = await Question.create({
      title,
      description,
      tags: tagIds,
      author: req.user._id
    });

    // Update tag question counts
    for (const tagId of tagIds) {
      await Tag.findByIdAndUpdate(tagId, { $inc: { questionCount: 1 } });
    }

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username reputation avatar')
      .populate('tags', 'name color');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: {
        question: populatedQuestion
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
const updateQuestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, description, tags } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question || question.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own questions'
      });
    }

    // Process tags if provided
    let tagIds = question.tags;
    if (tags) {
      // Remove old tags from count
      for (const tagId of question.tags) {
        await Tag.findByIdAndUpdate(tagId, { $inc: { questionCount: -1 } });
      }

      // Add new tags
      tagIds = [];
      for (const tagName of tags) {
        const tag = await Tag.findOrCreate(tagName, req.user._id);
        tagIds.push(tag._id);
      }

      // Update new tags count
      for (const tagId of tagIds) {
        await Tag.findByIdAndUpdate(tagId, { $inc: { questionCount: 1 } });
      }
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      {
        title: title || question.title,
        description: description || question.description,
        tags: tagIds
      },
      { new: true, runValidators: true }
    )
      .populate('author', 'username reputation avatar')
      .populate('tags', 'name color');

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: {
        question: updatedQuestion
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question || question.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check ownership or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own questions'
      });
    }

    // Soft delete question
    await question.softDelete();

    // Decrement tag counts
    for (const tagId of question.tags) {
      await Tag.findByIdAndUpdate(tagId, { $inc: { questionCount: -1 } });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on question
// @route   POST /api/questions/:id/vote
// @access  Private
const voteQuestion = async (req, res, next) => {
  try {
    const { voteType } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Vote type must be upvote or downvote'
      });
    }

    const question = await Question.findById(req.params.id);
    if (!question || question.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is voting on their own question
    if (question.author.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote on your own question'
      });
    }

    await question.addVote(req.user._id, voteType);

    // Create notification for question author
    if (voteType === 'upvote') {
      await Notification.createNotification(
        question.author,
        'question_voted',
        'Your question received an upvote',
        `${req.user.username} upvoted your question "${question.title}"`,
        {
          questionId: question._id,
          userId: req.user._id,
          voteType: 'upvote'
        }
      );
    }

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        voteCount: question.voteCount,
        userVote: voteType
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close/Open question
// @route   PUT /api/questions/:id/close
// @access  Private
const toggleQuestionStatus = async (req, res, next) => {
  try {
    const { isClosed } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question || question.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check permissions
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only close your own questions'
      });
    }

    if (isClosed) {
      await question.closeQuestion();
    } else {
      await question.openQuestion();
    }

    res.json({
      success: true,
      message: `Question ${isClosed ? 'closed' : 'opened'} successfully`,
      data: {
        isClosed: question.isClosed
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search questions
// @route   GET /api/questions/search
// @access  Public
const searchQuestions = async (req, res, next) => {
  try {
    const { q, page = 1, limit = config.defaultPageSize } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const skip = (page - 1) * limit;

    const questions = await Question.find({
      $text: { $search: q },
      isDeleted: false
    })
      .populate('author', 'username reputation avatar')
      .populate('tags', 'name color')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments({
      $text: { $search: q },
      isDeleted: false
    });

    res.json({
      success: true,
      data: {
        questions,
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

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
  toggleQuestionStatus,
  searchQuestions
};
