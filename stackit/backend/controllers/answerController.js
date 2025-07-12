
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');
const config = require('../config');

// @desc    Get answers for a question
// @route   GET /api/questions/:questionId/answers
// @access  Public
const getAnswers = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { page = 1, limit = config.defaultPageSize, sort = 'votes' } = req.query;

    const skip = (page - 1) * limit;

    // Verify question exists
    const question = await Question.findById(questionId);
    if (!question || question.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
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
        sortOption = { isAccepted: -1, voteCount: -1, createdAt: 1 };
        break;
      default:
        sortOption = { isAccepted: -1, voteCount: -1, createdAt: 1 };
    }

    const answers = await Answer.find({
      question: questionId,
      isDeleted: false
    })
      .populate('author', 'username reputation avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Answer.countDocuments({
      question: questionId,
      isDeleted: false
    });

    res.json({
      success: true,
      data: {
        answers,
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

// @desc    Create answer
// @route   POST /api/questions/:questionId/answers
// @access  Private
const createAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { questionId } = req.params;
    const { content } = req.body;

    // Verify question exists and is not closed
    const question = await Question.findById(questionId);
    if (!question || question.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (question.isClosed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot answer a closed question'
      });
    }

    // Check if user has already answered this question
    const existingAnswer = await Answer.findOne({
      question: questionId,
      author: req.user._id,
      isDeleted: false
    });

    if (existingAnswer) {
      return res.status(400).json({
        success: false,
        message: 'You have already answered this question'
      });
    }

    const answer = await Answer.create({
      content,
      question: questionId,
      author: req.user._id
    });

    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation avatar');

    // Create notification for question author
    await Notification.createNotification(
      question.author,
      'question_answered',
      'Your question received an answer',
      `${req.user.username} answered your question "${question.title}"`,
      {
        questionId: question._id,
        answerId: answer._id,
        userId: req.user._id
      }
    );

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      data: {
        answer: populatedAnswer
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update answer
// @route   PUT /api/answers/:id
// @access  Private
const updateAnswer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content } = req.body;

    const answer = await Answer.findById(req.params.id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check ownership
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own answers'
      });
    }

    const updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true, runValidators: true }
    )
      .populate('author', 'username reputation avatar');

    res.json({
      success: true,
      message: 'Answer updated successfully',
      data: {
        answer: updatedAnswer
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
// @access  Private
const deleteAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check ownership or admin
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own answers'
      });
    }

    // Soft delete answer
    await answer.softDelete();

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on answer
// @route   POST /api/answers/:id/vote
// @access  Private
const voteAnswer = async (req, res, next) => {
  try {
    const { voteType } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Vote type must be upvote or downvote'
      });
    }

    const answer = await Answer.findById(req.params.id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Check if user is voting on their own answer
    if (answer.author.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote on your own answer'
      });
    }

    await answer.addVote(req.user._id, voteType);

    // Create notification for answer author
    if (voteType === 'upvote') {
      await Notification.createNotification(
        answer.author,
        'answer_voted',
        'Your answer received an upvote',
        `${req.user.username} upvoted your answer`,
        {
          questionId: answer.question,
          answerId: answer._id,
          userId: req.user._id,
          voteType: 'upvote'
        }
      );
    }

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        voteCount: answer.voteCount,
        userVote: voteType
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept answer
// @route   PUT /api/answers/:id/accept
// @access  Private
const acceptAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    const question = await Question.findById(answer.question);
    if (!question || question.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the question author or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can accept answers'
      });
    }

    // If answer is already accepted, unaccept it
    if (answer.isAccepted) {
      await answer.unaccept();
      await question.acceptAnswer(null);

      res.json({
        success: true,
        message: 'Answer unaccepted successfully',
        data: {
          isAccepted: false
        }
      });
    } else {
      // Unaccept any previously accepted answer
      await Answer.updateMany(
        { question: question._id, isAccepted: true },
        { isAccepted: false }
      );

      // Accept this answer
      await answer.accept();
      await question.acceptAnswer(answer._id);

      // Create notification for answer author
      await Notification.createNotification(
        answer.author,
        'answer_accepted',
        'Your answer was accepted',
        `${req.user.username} accepted your answer`,
        {
          questionId: question._id,
          answerId: answer._id,
          userId: req.user._id
        }
      );

      res.json({
        success: true,
        message: 'Answer accepted successfully',
        data: {
          isAccepted: true
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to answer
// @route   POST /api/answers/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content } = req.body;

    const answer = await Answer.findById(req.params.id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    await answer.addComment(content, req.user._id);

    const updatedAnswer = await Answer.findById(req.params.id)
      .populate('author', 'username reputation avatar')
      .populate('comments.author', 'username reputation avatar');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        answer: updatedAnswer
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove comment from answer
// @route   DELETE /api/answers/:answerId/comments/:commentId
// @access  Private
const removeComment = async (req, res, next) => {
  try {
    const { answerId, commentId } = req.params;

    const answer = await Answer.findById(answerId);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    const comment = answer.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    await answer.removeComment(commentId);

    res.json({
      success: true,
      message: 'Comment removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
  addComment,
  removeComment
};
