const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { registerForEvent } = require('../controllers/registrationController');
const {
  broadcastAnnouncement,
  getEventMessages,
} = require('../controllers/announcementController');

const router = express.Router();

const eventValidationRules = [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('A valid date is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('category').isMongoId().withMessage('A valid category id is required'),
];

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: List events with filtering, pagination, sorting and search
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [date, -date, popularity] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: A paginated list of events }
 *   post:
 *     summary: Create an event (admin only)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Event created }
 *       401: { description: Not authenticated }
 *       403: { description: Not authorized }
 *       422: { description: Validation error }
 */
router.get('/', getEvents);
router.post('/', requireAuth, requireRole('admin'), eventValidationRules, validate, createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by id
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Event details }
 *       404: { description: Event not found }
 *   patch:
 *     summary: Update an event (admin only)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Event updated }
 *       404: { description: Event not found }
 *       422: { description: Validation error }
 *   delete:
 *     summary: Delete an event (admin only)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Event deleted }
 *       404: { description: Event not found }
 */
router.get('/:id', getEventById);
router.patch(
  '/:id',
  requireAuth,
  requireRole('admin'),
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('date').optional().isISO8601(),
    body('city').optional().trim().notEmpty(),
    body('capacity').optional().isInt({ min: 1 }),
    body('category').optional().isMongoId(),
  ],
  validate,
  updateEvent
);
router.delete('/:id', requireAuth, requireRole('admin'), deleteEvent);

/**
 * @swagger
 * /api/events/{eventId}/register:
 *   post:
 *     summary: Register the authenticated user for an event
 *     tags: [Registrations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Registered successfully }
 *       400: { description: Event full or already registered }
 *       401: { description: Not authenticated }
 *       404: { description: Event not found }
 */
router.post('/:eventId/register', requireAuth, registerForEvent);

/**
 * @swagger
 * /api/events/{eventId}/announcements:
 *   get:
 *     summary: Get the announcement history for an event
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of announcements ordered by time }
 *   post:
 *     summary: Broadcast a live announcement to an event's attendees (admin only)
 *     tags: [Announcements]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string }
 *     responses:
 *       201: { description: Announcement broadcast and saved }
 *       403: { description: Not authorized }
 *       404: { description: Event not found }
 *       422: { description: Validation error }
 */
router.get('/:eventId/announcements', getEventMessages);
router.post(
  '/:eventId/announcements',
  requireAuth,
  requireRole('admin'),
  [body('text').trim().notEmpty().withMessage('Announcement text is required')],
  validate,
  broadcastAnnouncement
);

module.exports = router;
