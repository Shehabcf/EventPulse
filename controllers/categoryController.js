const Category = require('../models/Category');
const Event = require('../models/Event');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/categories  (admin only)
exports.createCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (existing) {
    return next(new AppError('This category already exists', 400));
  }

  const category = await Category.create({ name });
  res.status(201).json({ status: 'success', data: { category } });
});

// GET /api/categories
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json({ status: 'success', results: categories.length, data: { categories } });
});

// GET /api/categories/:id
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }
  res.status(200).json({ status: 'success', data: { category } });
});

// PATCH /api/categories/:id  (admin only)
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const name = req.body.name.trim();
  const duplicate = await Category.findOne({ _id: { $ne: category._id }, name: { $regex: `^${name}$`, $options: 'i' } });
  if (duplicate) {
    return next(new AppError('This category name is already in use', 400));
  }

  category.name = name;
  await category.save();
  res.status(200).json({ status: 'success', data: { category } });
});

// DELETE /api/categories/:id  (admin only)
// A category with events cannot be deleted — this keeps the event↔category
// reference intact so saved events are never left with a broken link.
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const eventsInCategory = await Event.countDocuments({ category: category._id });
  if (eventsInCategory > 0) {
    return next(
      new AppError(`Cannot delete a category that still has ${eventsInCategory} event(s). Remove or reassign them first`, 400)
    );
  }

  await category.deleteOne();
  res.status(204).json({ status: 'success', data: null });
});
