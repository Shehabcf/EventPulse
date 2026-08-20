const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List all event categories
 *     tags: [Categories]
 *     responses:
 *       200: { description: List of categories }
 *   post:
 *     summary: Create a category (admin only)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201: { description: Category created }
 *       400: { description: Category already exists }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized }
 *       422: { description: Validation error }
 */
router.get('/', getCategories);
router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  createCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a single category by id
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category details }
 *       404: { description: Category not found }
 *   patch:
 *     summary: Update a category name (admin only)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200: { description: Category updated }
 *       400: { description: Name already in use }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized }
 *       404: { description: Category not found }
 *   delete:
 *     summary: Delete a category (admin only, fails if events use it)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Category deleted }
 *       400: { description: Category still has events }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized }
 *       404: { description: Category not found }
 */
router.get('/:id', getCategoryById);
router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  updateCategory
);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

module.exports = router;
