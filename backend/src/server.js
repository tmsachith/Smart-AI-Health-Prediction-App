require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const readingRoutes = require('./routes/readingRoutes');
const alertRoutes = require('./routes/alertRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🏥 Smart AI Health Prediction API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      readings: '/api/readings',
      alerts: '/api/alerts',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/alerts', alertRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`🏥 Smart AI Health Prediction API`);
  console.log(`🌍 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('========================================\n');
  console.log('📋 Available Endpoints:');
  console.log(`   - Health Check: http://localhost:${PORT}/`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Readings: http://localhost:${PORT}/api/readings`);
  console.log(`   - Alerts: http://localhost:${PORT}/api/alerts`);
  console.log('\n========================================\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  console.log('🛑 Shutting down server...');
  process.exit(1);
});

module.exports = app;
