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
  }
];
let payments = [];

// Health check
app.get('/api/health', (req, res) => {
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
});

// User routes
app.post('/api/users', (req, res) => {
  try {
    const { id, email, role = 'student' } = req.body;
    
    if (!id || !email) {
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
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    console.log('User created:', newUser.email);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = users.find(user => user.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.patch('/api/users/:id/access', (req, res) => {
  try {
    const { hasAccess } = req.body;
    const userIndex = users.findIndex(user => user.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].has_access = hasAccess;
    console.log('User access updated:', users[userIndex].email, hasAccess);
    res.json(users[userIndex]);
  } catch (error) {
    console.error('Error updating user access:', error);
    res.status(500).json({ error: 'Failed to update user access' });
  }
});

app.patch('/api/users/:id/progress', (req, res) => {
  try {
    const { progress } = req.body;
    const userIndex = users.findIndex(user => user.id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].progress = progress;
    console.log('User progress updated:', users[userIndex].email);
    res.json(users[userIndex]);
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ error: 'Failed to update user progress' });
  }
});

app.get('/api/users', (req, res) => {
  try {
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Module routes
app.get('/api/modules', (req, res) => {
  try {
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

app.get('/api/modules/published', (req, res) => {
  try {
    const publishedModules = modules.filter(module => module.is_published);
    res.json(publishedModules);
  } catch (error) {
    console.error('Error fetching published modules:', error);
    res.status(500).json({ error: 'Failed to fetch published modules' });
  }
});

app.post('/api/modules', (req, res) => {
  try {
    const { title, description, videoUrl, pdfUrl, order, isPublished } = req.body;
    
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
      created_at: new Date().toISOString()
    };
    
    modules.push(newModule);
    console.log('Module created:', newModule.title);
    res.status(201).json(newModule);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

app.put('/api/modules/:id', (req, res) => {
  try {
    const { title, description, videoUrl, pdfUrl, order, isPublished } = req.body;
    const moduleIndex = modules.findIndex(module => module.id == req.params.id);
    
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
      is_published: isPublished !== undefined ? isPublished : modules[moduleIndex].is_published
    };
    
    console.log('Module updated:', modules[moduleIndex].title);
    res.json(modules[moduleIndex]);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

app.delete('/api/modules/:id', (req, res) => {
  try {
    const moduleIndex = modules.findIndex(module => module.id == req.params.id);
    
    if (moduleIndex === -1) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    const deletedModule = modules.splice(moduleIndex, 1)[0];
    console.log('Module deleted:', deletedModule.title);
    res.json(deletedModule);
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

// Payment routes
app.post('/api/payments', (req, res) => {
  try {
    const { userId, amount, status = 'pending' } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ error: 'User ID and amount are required' });
    }
    
    const newPayment = {
      id: payments.length + 1,
      user_id: userId,
      amount: parseFloat(amount),
      status,
      created_at: new Date().toISOString()
    };
    
    payments.push(newPayment);
    console.log('Payment created:', newPayment.id, newPayment.amount);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

app.patch('/api/payments/:id/status', (req, res) => {
  try {
    const { status, razorpayPaymentId } = req.body;
    const paymentIndex = payments.findIndex(payment => payment.id == req.params.id);
    
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    payments[paymentIndex].status = status;
    if (razorpayPaymentId) {
      payments[paymentIndex].razorpay_payment_id = razorpayPaymentId;
    }
    
    console.log('Payment status updated:', payments[paymentIndex].id, status);
    res.json(payments[paymentIndex]);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

app.get('/api/payments/user/:userId', (req, res) => {
  try {
    const userPayments = payments.filter(payment => payment.user_id === req.params.userId);
    res.json(userPayments);
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ error: 'Failed to fetch user payments' });
  }
});

app.get('/api/payments', (req, res) => {
  try {
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI 99 Course Platform API',
    version: '1.0.0',
    status: 'running'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Internal server error' });
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
  console.log(`📊 Initial data: ${users.length} users, ${modules.length} modules, ${payments.length} payments`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

module.exports = app;