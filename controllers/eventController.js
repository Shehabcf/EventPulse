const Event = require('../models/Event');
const Registration = require('../models/Registration');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/events  (admin only)
exports.createEvent = asyncHandler(async (req, res, next) => {
  const { name, description, date, city, capacity, category } = req.body;

  const event = await Event.create({
    name,
    description,
    date,
    city,
    capacity,
    category,
    createdBy: req.user.id,
  });

  const populated = await event.populate('category');

  res.status(201).json({ status: 'success', data: { event: populated } });
});

// GET /api/events
// Supports: category, city, startDate, endDate, page, limit, sort, search
exports.getEvents = asyncHandler(async (req, res, next) => {
  const { category, city, startDate, endDate, page = 1, limit = 10, sort, search } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (city) filter.city = new RegExp(`^${city}$`, 'i');
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (search) {
    filter.$text = { $search: search };
  }

  let sortOption = { date: 1 };
  if (sort === 'date') sortOption = { date: 1 };
  if (sort === '-date') sortOption = { date: -1 };
  if (sort === 'popularity') sortOption = { registrationsCount: -1 };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [events, totalCount] = await Promise.all([
    Event.find(filter).populate('category').sort(sortOption).skip(skip).limit(limitNum),
    Event.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    results: events.length,
    totalCount,
    currentPage: pageNum,
    totalPages: Math.ceil(totalCount / limitNum) || 1,
    data: { events },
  });
});

// GET /api/events/:id
exports.getEventById = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate('category');
  if (!event) {
    return next(new AppError('Event not found', 404));
  }
  res.status(200).json({ status: 'success', data: { event } });
});

// PATCH /api/events/:id  (admin only)
exports.updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('category');

  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  res.status(200).json({ status: 'success', data: { event } });
});

// DELETE /api/events/:id  (admin only)
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }
  // clean up dependent registrations so counts stay consistent
  await Registration.deleteMany({ event: event._id });

  res.status(204).json({ status: 'success', data: null });
});
