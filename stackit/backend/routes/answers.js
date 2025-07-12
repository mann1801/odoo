const express = require('express');
const { protect } = require('../middleware/auth');
const answerController = require('../controllers/answerController');
const { body } = require('express-validator');
const config = require('../config');

const router = express.Router();

// Validation for creating/updating answers
const answerValidation = [
  body('content')
    .trim()
    .isLength({ min: 10, max: config.answerContentMaxLength })
    .withMessage(`Answer must be between 10 and ${config.answerContentMaxLength} characters`)
];

// Get answers for a question
router.get('/question/:questionId', answerController.getAnswers);
// Create answer for a question
router.post('/question/:questionId', protect, answerValidation, answerController.createAnswer);
// Update answer
router.put('/:id', protect, answerValidation, answerController.updateAnswer);
// Delete answer
router.delete('/:id', protect, answerController.deleteAnswer);
// Vote on answer
router.post('/:id/vote', protect, answerController.voteAnswer);
// Accept/unaccept answer
router.put('/:id/accept', protect, answerController.acceptAnswer);
// Add comment to answer
router.post('/:id/comments', protect, [body('content').trim().isLength({ min: 2, max: 1000 })], answerController.addComment);
// Remove comment from answer
router.delete('/:answerId/comments/:commentId', protect, answerController.removeComment);

module.exports = router; 