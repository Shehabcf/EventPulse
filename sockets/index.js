// Initializes Socket.io: room joining per event, connection/disconnection logging.
// Broadcasting itself happens from announcementController via req.app.get('io'),
// so admin-only authorization can be enforced through the normal REST middleware chain.
function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinEvent', (eventId) => {
      if (!eventId) return;
      socket.join(eventId.toString());
      console.log(`Socket ${socket.id} joined event room ${eventId}`);
    });

    socket.on('leaveEvent', (eventId) => {
      if (!eventId) return;
      socket.leave(eventId.toString());
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = initSocket;
