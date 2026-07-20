require('dotenv').config();
const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const citizenRoutes = require('./routes/citizenRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const wellbeingRoutes = require('./routes/wellbeingRoutes');
const communityRoutes = require('./routes/communityRoutes');
const educationRoutes = require('./routes/educationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ambassadorRoutes = require('./routes/ambassadorRoutes');
const researchRoutes = require('./routes/researchRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middleware/errorHandler');
const registerTelemedicineSocket = require('./sockets/telemedicineSocket');

const app = express();

connectDB();

const corsOptions = {
  // In dev allow any origin (covers localhost, ngrok, mobile via tunnel, etc.)
  // In production lock this down to the real domain.
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'http://localhost:5173')
    : true,
  credentials: true, // required so browser sends/receives httpOnly refresh cookie
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
};

app.use(helmet());
app.use(cors(corsOptions));
// Default 100kb is too small for base64-encoded file uploads (lab report
// scans) — raised to accommodate them. See uploadValidation.js for the
// actual per-file size cap enforced before anything hits disk.
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Uploaded lab report files (see citizenController.createLabReport). Served
// same-origin through the dev/prod proxy (see vite.config.ts / nginx.conf),
// same pattern as /api and /socket.io — never a genuinely cross-origin request.
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/citizens', citizenRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wellbeing', wellbeingRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ambassador', ambassadorRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

// Wrap express in a plain http.Server so Socket.IO (used by the Telemedicine
// module for WebRTC signaling + live chat) can share the same port.
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });
registerTelemedicineSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
