// ============================================
// MAIN SERVER FILE (server.js)
// ============================================
// This is the entry point of our backend application.
// It brings together the database connection, middleware, and routes.
// ============================================

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const candidateRoutes = require('./routes/candidates');
const conversationRoutes = require('./routes/conversations');
const userRoutes = require('./routes/users');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================
// Enable CORS so the frontend (React) can communicate with this backend
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  }),
);

// Parse incoming JSON payloads (replaces body-parser)
app.use(express.json());

// ============================================
// REQUEST LOGGER
// ============================================
app.use((req, res, next) => {
  const safeBody = { ...req.body };
  if (safeBody.password) safeBody.password = '[REDACTED]';
  console.log(
    `[REQUEST] ${req.method} ${req.originalUrl} query=${JSON.stringify(req.query)} body=${JSON.stringify(safeBody)}`,
  );
  next();
});

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/users', userRoutes);

// Simple health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'TalentBridge API is running!' });
});

// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware (catch-all for unexpected errors)
app.use((err, req, res, next) => {
  const safeBody = { ...req.body };
  if (safeBody.password) safeBody.password = '[REDACTED]';
  console.error('[ERROR] Unhandled error', {
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    body: safeBody,
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// ============================================
// DATABASE CONNECTION
// ============================================
// Start the HTTP server only after the database connection succeeds.
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server, {
  corsOrigin: allowedOrigins.length ? allowedOrigins : true,
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB, exiting.', error);
    process.exit(1);
  });
