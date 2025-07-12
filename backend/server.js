const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Import routes
const usersRoutes = require('./routes/users');
const modulesRoutes = require('./routes/modules');
const paymentsRoutes = require('./routes/payments');

// Use routes
app.use('/api/users', usersRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/payments', paymentsRoutes);

// Health check
app.get('/api/health', asyncHandler(async (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI99 Backend is running',
    timestamp: new Date().toISOString()
  });
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI 99 Course Platform API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      modules: '/api/modules',
      payments: '/api/payments'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  console.error('Error stack:', err.stack);
  
  // Send detailed error in development
  const errorResponse = {
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  
  res.status(500).json(errorResponse);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI99 Backend Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API docs: http://localhost:${PORT}/`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

module.exports = app;