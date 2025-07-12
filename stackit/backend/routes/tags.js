const express = require('express');
const { protect } = require('../middleware/auth');
const { canCreateTags } = require('../middleware/roles');
const tagController = require('../controllers/tagController');
const { body } = require('express-validator');

const router = express.Router();

// Validation for creating/updating tags
const tagValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Tag name must be between 2 and 20 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Tag name can only contain lowercase letters, numbers, and hyphens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color')
];

// List all tags
router.get('/', tagController.getTags);

// Get popular tags - MUST come before /:id route
router.get('/popular', tagController.getPopularTags);

// Search tags - MUST come before /:id route
router.get('/search', tagController.searchTags);

// Get single tag - parameterized route comes after specific routes
router.get('/:id', tagController.getTag);

// Create tag
router.post('/', protect, canCreateTags, tagValidation, tagController.createTag);

// Update tag
router.put('/:id', protect, canCreateTags, tagValidation, tagController.updateTag);

// Delete tag
router.delete('/:id', protect, canCreateTags, tagController.deleteTag);

// Make tag official/unofficial (admin only)
router.put('/:id/official', protect, tagController.makeTagOfficial);

module.exports = router; 