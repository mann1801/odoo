const express = require('express');
const { protect } = require('../middleware/auth');
const questionController = require('../controllers/questionController');
const answerController = require('../controllers/answerController');
const { body } = require('express-validator');
const config = require('../config');

const router = express.Router();

// Validation for creating/updating questions
const questionValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: config.questionTitleMaxLength })
    .withMessage(`Title must be between 10 and ${config.questionTitleMaxLength} characters`),
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('tags')
    .isArray({ min: 1 })
    .withMessage('At least one tag is required')
];

// Validation for creating/updating answers
const answerValidation = [
  body('content')
    .trim()
    .isLength({ min: 10, max: config.answerContentMaxLength })
    .withMessage(`Answer must be between 10 and ${config.answerContentMaxLength} characters`)
];

// List all questions
router.get('/', questionController.getQuestions);
// Search questions
router.get('/search', questionController.searchQuestions);
// Get single question
router.get('/:id', questionController.getQuestion);
// Create question
router.post('/', protect, questionValidation, questionController.createQuestion);
// Update question
router.put('/:id', protect, questionValidation, questionController.updateQuestion);
// Delete question
router.delete('/:id', protect, questionController.deleteQuestion);
// Vote on question
router.post('/:id/vote', protect, questionController.voteQuestion);
// Close/open question
router.put('/:id/close', protect, questionController.toggleQuestionStatus);

// Answer routes for this question
router.get('/:questionId/answers', answerController.getAnswers);
router.post('/:questionId/answers', protect, answerValidation, answerController.createAnswer);

module.exports = router; 