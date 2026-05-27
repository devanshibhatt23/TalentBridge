// ============================================
// MAIN SERVER FILE (server.js)
// ============================================
// This is the entry point of our backend application.
// It brings together the database connection, middleware, and routes.
// ============================================

require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const candidateRoutes = require('./routes/candidates');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================
// Enable CORS so the frontend (React) can communicate with this backend
app.use(cors());

// Parse incoming JSON payloads (replaces body-parser)
app.use(express.json());

// ============================================
// DATABASE CONNECTION
// ============================================
// Connect to MongoDB using the function we defined in config/db.js
// We wrap it in an async IIFE (Immediately Invoked Function Expression)
// or just call it directly since it handles its own errors
connectDB();

// ============================================
// ROUTES
// ============================================
// Mount the routes on specific base URLs
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/candidates', candidateRoutes);

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
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
