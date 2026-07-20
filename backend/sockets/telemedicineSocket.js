const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * Telemedicine signaling + chat.
 * Room id = the Appointment's own _id (both citizen and doctor join the
 * same room). Relays WebRTC offer/answer/ICE candidates peer-to-peer via
 * the server, and persists chat messages onto the appointment document.
 */
function registerTelemedicineSocket(io) {
  const nsp = io.of('/telemedicine');

  // Authenticate every socket connection using the same access token the
  // REST API uses (sent via `auth: { token }` on the client).
  nsp.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(payload.sub);
      if (!user || !user.isActive) return next(new Error('User no longer active'));

      socket.user = { id: user._id.toString(), role: user.role };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  nsp.on('connection', (socket) => {
    let currentRoomId = null;

    socket.on('join-room', async ({ appointmentId }, ack) => {
      try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return ack?.({ success: false, message: 'Appointment not found' });

        const isParticipant =
          appointment.citizen.toString() === socket.user.id ||
          (appointment.doctor && appointment.doctor.toString() === socket.user.id);

        if (!isParticipant) return ack?.({ success: false, message: 'Not a participant on this appointment' });

        currentRoomId = appointmentId;
        socket.join(appointmentId);
        socket.to(appointmentId).emit('peer-joined', { userId: socket.user.id, role: socket.user.role });
        ack?.({ success: true });
      } catch (err) {
        ack?.({ success: false, message: 'Failed to join room' });
      }
    });

    // WebRTC signaling relay — server never inspects SDP/ICE payloads,
    // just forwards them to the other participant in the room.
    socket.on('webrtc-signal', ({ appointmentId, signal }) => {
      if (appointmentId !== currentRoomId) return;
      socket.to(appointmentId).emit('webrtc-signal', { from: socket.user.id, signal });
    });

    socket.on('chat-message', async ({ appointmentId, text }, ack) => {
      if (appointmentId !== currentRoomId || !text?.trim()) return ack?.({ success: false });
      try {
        const message = {
          sender: socket.user.id,
          senderRole: socket.user.role,
          text: text.trim().slice(0, 2000),
          sentAt: new Date(),
        };
        await Appointment.updateOne({ _id: appointmentId }, { $push: { chatMessages: message } });
        nsp.to(appointmentId).emit('chat-message', message);
        ack?.({ success: true });
      } catch (err) {
        ack?.({ success: false });
      }
    });

    socket.on('leave-room', () => {
      if (currentRoomId) {
        socket.to(currentRoomId).emit('peer-left', { userId: socket.user.id });
        socket.leave(currentRoomId);
        currentRoomId = null;
      }
    });

    socket.on('disconnect', () => {
      if (currentRoomId) {
        socket.to(currentRoomId).emit('peer-left', { userId: socket.user.id });
      }
    });
  });
}

module.exports = registerTelemedicineSocket;
