const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200: { description: Server and database status }
 */
router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = dbStates[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'success',
    server: 'up',
    database: dbState,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
