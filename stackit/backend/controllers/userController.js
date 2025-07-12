const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { validationResult } = require('express-validator');

// @desc    Get user profile
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findOne({ username, isDeleted: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skip = (page - 1) * limit;

    // Get user's questions
    const questions = await Question.find({
      author: user._id,
      isDeleted: false
    })
      .populate('tags', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get user's answers
    const answers = await Answer.find({
      author: user._id,
      isDeleted: false
    })
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const questionCount = await Question.countDocuments({
      author: user._id,
      isDeleted: false
    });

    const answerCount = await Answer.countDocuments({
      author: user._id,
      isDeleted: false
    });

    res.json({
      success: true,
      data: {
        user: user.getProfile(),
        questions,
        answers,
        stats: {
          questionCount,
          answerCount,
          reputation: user.reputation
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = config.defaultPageSize,
      sort = 'reputation',
      search,
      role
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { isDeleted: false };

    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'reputation':
        sortOption = { reputation: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'username':
        sortOption = { username: 1 };
        break;
      default:
        sortOption = { reputation: -1 };
    }

    const users = await User.find(query)
      .select('-password')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

// @desc    Ban/Unban user (admin only)
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
const toggleUserBan = async (req, res, next) => {
  try {
    const { isBanned } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent banning admins
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    user.isBanned = isBanned;
    await user.save();

    res.json({
      success: true,
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      data: {
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role changed to ${role} successfully`,
      data: {
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admins
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Soft delete user
    user.isDeleted = true;
    await user.save();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private
const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const questionCount = await Question.countDocuments({
      author: user._id,
      isDeleted: false
    });

    const answerCount = await Answer.countDocuments({
      author: user._id,
      isDeleted: false
    });

    const acceptedAnswerCount = await Answer.countDocuments({
      author: user._id,
      isAccepted: true,
      isDeleted: false
    });

    const totalVotes = await Question.aggregate([
      { $match: { author: user._id, isDeleted: false } },
      { $project: { totalVotes: { $add: [{ $size: '$votes.upvotes' }, { $size: '$votes.downvotes' }] } } },
      { $group: { _id: null, total: { $sum: '$totalVotes' } } }
    ]);

    const answerVotes = await Answer.aggregate([
      { $match: { author: user._id, isDeleted: false } },
      { $project: { totalVotes: { $add: [{ $size: '$votes.upvotes' }, { $size: '$votes.downvotes' }] } } },
      { $group: { _id: null, total: { $sum: '$totalVotes' } } }
    ]);

    res.json({
      success: true,
      data: {
        questionCount,
        answerCount,
        acceptedAnswerCount,
        totalVotes: (totalVotes[0]?.total || 0) + (answerVotes[0]?.total || 0),
        reputation: user.reputation,
        joinDate: user.createdAt,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  getUsers,
  toggleUserBan,
  changeUserRole,
  deleteUser,
  getUserStats
};
