const Event = require('../models/Event');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/events/:eventId/announcements  (admin only)
// Saves the message then broadcasts it over Socket.io to the event's room
exports.broadcastAnnouncement = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const { text } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  const message = await Message.create({
    event: eventId,
    sender: req.user.id,
    text,
  });

  const populated = await message.populate('sender', 'name role');

  const io = req.app.get('io');
  if (io) {
    io.to(eventId.toString()).emit('newAnnouncement', {
      id: populated._id,
      event: eventId,
      sender: { id: populated.sender._id, name: populated.sender.name },
      text: populated.text,
      createdAt: populated.createdAt,
    });
  }

  res.status(201).json({ status: 'success', data: { message: populated } });
});

// GET /api/events/:eventId/announcements
exports.getEventMessages = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('Event not found', 404));
  }

  const messages = await Message.find({ event: eventId })
    .sort({ createdAt: 1 })
    .populate('sender', 'name role');

  res.status(200).json({ status: 'success', results: messages.length, data: { messages } });
});
