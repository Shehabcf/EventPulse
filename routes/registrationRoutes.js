const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { getMyRegistrations, cancelRegistration } = require('../controllers/registrationController');

const router = express.Router();

/**
 * @swagger
 * /api/registrations/me:
 *   get:
 *     summary: Get the authenticated user's registrations
 *     tags: [Registrations]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of the current user's registrations }
 *       401: { description: Not authenticated }
 */
router.get('/me', requireAuth, getMyRegistrations);

/**
 * @swagger
 * /api/registrations/{id}:
 *   delete:
 *     summary: Cancel a registration (must belong to the authenticated user)
 *     tags: [Registrations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Registration cancelled }
 *       403: { description: Not the owner of this registration }
 *       404: { description: Registration not found }
 */
router.delete('/:id', requireAuth, cancelRegistration);

module.exports = router;
