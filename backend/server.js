const express = require('express');
const cors = require('cors');

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

// In-memory storage
let users = [];
let modules = [
  {
    id: 1,
    title: "Introduction to AI",
    description: "Learn the fundamentals of Artificial Intelligence",
    video_url: "https://www.youtube.com/embed/JMUxmLyrhSk",
    pdf_url: "https://example.com/ai-intro.pdf",
    order_num: 1,
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Machine Learning Basics",
    description: "Understanding ML algorithms and concepts",
    video_url: "https://www.youtube.com/embed/ukzFI9rgwfU",
    pdf_url: "https://example.com/ml-basics.pdf",
    order_num: 2,
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Deep Learning Fundamentals",
    description: "Dive into neural networks and deep learning",
    video_url: "https://www.youtube.com/embed/aircAruvnKk",
    pdf_url: "https://example.com/deep-learning.pdf",
    order_num: 3,
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    title: "Natural Language Processing",
    description: "Explore text processing, sentiment analysis, and language models",
    video_url: "https://www.youtube.com/embed/fOvTtapxa9c",
    pdf_url: "https://example.com/nlp-notes.pdf",
    order_num: 4,
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    title: "Computer Vision",
    description: "Learn image processing, object detection, and facial recognition",
    video_url: "https://www.youtube.com/embed/OcycT1Jwsns",
    pdf_url: "https://example.com/cv-notes.pdf",
    order_num: 5,
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    title: "AI Ethics & Future",
    description: "Understand responsible AI development and future career opportunities",
    video_url: "https://www.youtube.com/embed/UwsrzCVZAb8",
    pdf_url: "https://example.com/ethics-notes.pdf",
    order_num: 6,
    is_published: true,
    created_at: new Date().toISOString()
  }
];
let payments = [];

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Health check
app.get('/api/health', asyncHandler(async (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI99 Backend is running',
    timestamp: new Date().toISOString(),
    stats: {
      users: users.length,
      modules: modules.length,
      payments: payments.length
    }
  });
}));

// User routes
app.post('/api/users', asyncHandler(async (req, res) => {
  const { id, email, role = 'student' } = req.body;
  
  console.log('Creating user request:', { id, email, role });
  
  if (!id || !email) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'ID and email are required' });
  }
  
  const existingUser = users.find(user => user.id === id || user.email === email);
  if (existingUser) {
    console.log('User already exists:', existingUser.email);
    return res.json(existingUser);
  }
  
  const newUser = {
    id,
    email,
    role,
    has_access: role === 'admin' ? true : false,
    progress: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  users.push(newUser);
  console.log('User created successfully:', newUser.email);
  res.status(201).json(newUser);
}));

app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('Fetching user with ID:', id);
  
  if (!id) {
    console.log('No user ID provided');
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  const user = users.find(user => user.id === id);
  if (!user) {
    console.log('User not found:', id);
    return res.status(404).json({ error: 'User not found' });
  }
  
  console.log('User found:', user.email);
  res.json(user);
}));

app.patch('/api/users/:id/access', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { hasAccess } = req.body;
  
  console.log('Updating user access:', { id, hasAccess });
  
  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    console.log('User not found for access update:', id);
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[userIndex].has_access = hasAccess;
  users[userIndex].updated_at = new Date().toISOString();
  
  console.log('User access updated:', users[userIndex].email, hasAccess);
  res.json(users[userIndex]);
}));

app.patch('/api/users/:id/progress', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  
  console.log('Updating user progress:', { id, progress });
  
  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    console.log('User not found for progress update:', id);
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[userIndex].progress = progress || {};
  users[userIndex].updated_at = new Date().toISOString();
  
  console.log('User progress updated:', users[userIndex].email);
  res.json(users[userIndex]);
}));

app.get('/api/users', asyncHandler(async (req, res) => {
  console.log('Fetching all users, count:', users.length);
  res.json(users);
}));

// Module routes
app.get('/api/modules', asyncHandler(async (req, res) => {
  console.log('Fetching all modules, count:', modules.length);
  res.json(modules);
}));

app.get('/api/modules/published', asyncHandler(async (req, res) => {
  const publishedModules = modules.filter(module => module.is_published);
  console.log('Fetching published modules, count:', publishedModules.length);
  res.json(publishedModules);
}));

app.post('/api/modules', asyncHandler(async (req, res) => {
  const { title, description, videoUrl, pdfUrl, order, isPublished } = req.body;
  
  console.log('Creating module:', { title, description });
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  
  const newModule = {
    id: modules.length + 1,
    title,
    description,
    video_url: videoUrl || '',
    pdf_url: pdfUrl || '',
    order_num: order || modules.length + 1,
    is_published: isPublished || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  modules.push(newModule);
  console.log('Module created:', newModule.title);
  res.status(201).json(newModule);
}));

app.put('/api/modules/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, videoUrl, pdfUrl, order, isPublished } = req.body;
  
  console.log('Updating module:', id);
  
  const moduleIndex = modules.findIndex(module => module.id == id);
  if (moduleIndex === -1) {
    return res.status(404).json({ error: 'Module not found' });
  }
  
  modules[moduleIndex] = {
    ...modules[moduleIndex],
    title: title || modules[moduleIndex].title,
    description: description || modules[moduleIndex].description,
    video_url: videoUrl !== undefined ? videoUrl : modules[moduleIndex].video_url,
    pdf_url: pdfUrl !== undefined ? pdfUrl : modules[moduleIndex].pdf_url,
    order_num: order !== undefined ? order : modules[moduleIndex].order_num,
    is_published: isPublished !== undefined ? isPublished : modules[moduleIndex].is_published,
    updated_at: new Date().toISOString()
  };
  
  console.log('Module updated:', modules[moduleIndex].title);
  res.json(modules[moduleIndex]);
}));

app.delete('/api/modules/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('Deleting module:', id);
  
  const moduleIndex = modules.findIndex(module => module.id == id);
  if (moduleIndex === -1) {
    return res.status(404).json({ error: 'Module not found' });
  }
  
  const deletedModule = modules.splice(moduleIndex, 1)[0];
  console.log('Module deleted:', deletedModule.title);
  res.json(deletedModule);
}));

// Payment routes
app.post('/api/payments', asyncHandler(async (req, res) => {
  const { userId, amount, status = 'pending' } = req.body;
  
  console.log('Creating payment:', { userId, amount, status });
  
  if (!userId || !amount) {
    return res.status(400).json({ error: 'User ID and amount are required' });
  }
  
  const newPayment = {
    id: payments.length + 1,
    user_id: userId,
    amount: parseFloat(amount),
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  payments.push(newPayment);
  console.log('Payment created:', newPayment.id, newPayment.amount);
  res.status(201).json(newPayment);
}));

app.patch('/api/payments/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, razorpayPaymentId } = req.body;
  
  console.log('Updating payment status:', { id, status });
  
  const paymentIndex = payments.findIndex(payment => payment.id == id);
  if (paymentIndex === -1) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  
  payments[paymentIndex].status = status;
  payments[paymentIndex].updated_at = new Date().toISOString();
  if (razorpayPaymentId) {
    payments[paymentIndex].razorpay_payment_id = razorpayPaymentId;
  }
  
  console.log('Payment status updated:', payments[paymentIndex].id, status);
  res.json(payments[paymentIndex]);
}));

app.get('/api/payments/user/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log('Fetching payments for user:', userId);
  
  const userPayments = payments.filter(payment => payment.user_id === userId);
  console.log('User payments found:', userPayments.length);
  res.json(userPayments);
}));

app.get('/api/payments', asyncHandler(async (req, res) => {
  console.log('Fetching all payments, count:', payments.length);
  res.json(payments);
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
  console.log(`📊 Initial data loaded:`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Modules: ${modules.length}`);
  console.log(`   - Payments: ${payments.length}`);
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