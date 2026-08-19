const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/events/:eventId/register
exports.registerForEvent = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  // Atomically reserve a spot only if the event still has capacity left.
  // This avoids a race condition where two requests both pass a plain read-then-check.
  const reserved = await Event.findOneAndUpdate(
    { _id: eventId, $expr: { $lt: ['$registrationsCount', '$capacity'] } },
    { $inc: { registrationsCount: 1 } },
    { new: true }
  );

  if (!reserved) {
    return next(new AppError('This event has reached its full capacity', 400));
  }

  try {
    const registration = await Registration.create({ user: userId, event: eventId });
    const populated = await registration.populate('event');
    return res.status(201).json({ status: 'success', data: { registration: populated } });
  } catch (err) {
    // roll back the reserved spot since the registration failed
    await Event.findByIdAndUpdate(eventId, { $inc: { registrationsCount: -1 } });

    if (err.code === 11000) {
      return next(new AppError('You are already registered for this event', 400));
    }
    return next(err);
  }
});

// GET /api/registrations/me
exports.getMyRegistrations = asyncHandler(async (req, res, next) => {
  const registrations = await Registration.find({ user: req.user.id }).populate({
    path: 'event',
    populate: { path: 'category' },
  });

  res.status(200).json({ status: 'success', results: registrations.length, data: { registrations } });
});

// DELETE /api/registrations/:id
exports.cancelRegistration = asyncHandler(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  if (registration.user.toString() !== req.user.id) {
    return next(new AppError('You can only cancel your own registration', 403));
  }

  await registration.deleteOne();
  await Event.findByIdAndUpdate(registration.event, { $inc: { registrationsCount: -1 } });

  res.status(204).json({ status: 'success', data: null });
});
