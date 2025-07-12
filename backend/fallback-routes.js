const express = require('express');
const router = express.Router();

// In-memory storage for fallback
let users = [];
let modules = [
  {
    id: 1,
    title: "Introduction to AI",
    description: "Learn the fundamentals of Artificial Intelligence",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    pdf_url: "https://example.com/notes1.pdf",
    order_num: 1,
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Machine Learning Basics",
    description: "Understanding ML algorithms and concepts",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    pdf_url: "https://example.com/notes2.pdf",
    order_num: 2,
    is_published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Deep Learning Fundamentals",
    description: "Dive into neural networks and deep learning",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    pdf_url: "https://example.com/notes3.pdf",
    order_num: 3,
    is_published: true,
    created_at: new Date().toISOString()
  }
];
let payments = [];

// User routes
router.post('/', (req, res) => {
  try {
    const { id, email, role = 'student' } = req.body;
    
    if (!id || !email) {
      return res.status(400).json({ error: 'ID and email are required' });
    }
    
    console.log('Creating user:', { id, email, role });
    
    const existingUser = users.find(user => user.id === id || user.email === email);
    if (existingUser) {
      console.log('User already exists');
      return res.json(existingUser);
    }
    
    const newUser = {
      id,
      email,
      role,
      has_access: false,
      progress: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    users.push(newUser);
    console.log('User created:', newUser);
    res.json(newUser);
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching user with ID:', id);
    
    const user = users.find(user => user.id === id);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found:', user);
    res.json(user);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.patch('/:id/access', (req, res) => {
  try {
    const { id } = req.params;
    const { hasAccess } = req.body;
    
    console.log('Updating user access:', { id, hasAccess });
    
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].has_access = hasAccess;
    users[userIndex].updated_at = new Date().toISOString();
    
    console.log('User access updated:', users[userIndex]);
    res.json(users[userIndex]);
    
  } catch (error) {
    console.error('Error updating user access:', error);
    res.status(500).json({ error: 'Failed to update user access' });
  }
});

router.patch('/:id/progress', (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    
    console.log('Updating user progress:', { id, progress });
    
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].progress = progress;
    users[userIndex].updated_at = new Date().toISOString();
    
    console.log('User progress updated:', users[userIndex]);
    res.json(users[userIndex]);
    
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ error: 'Failed to update user progress' });
  }
});

router.get('/', (req, res) => {
  try {
    console.log('Fetching all users, count:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Module routes (when accessed via /api/modules)
router.get('/published', (req, res) => {
  try {
    console.log('Fetching published modules');
    const publishedModules = modules.filter(module => module.is_published);
    console.log('Published modules count:', publishedModules.length);
    res.json(publishedModules);
  } catch (error) {
    console.error('Error fetching published modules:', error);
    res.status(500).json({ error: 'Failed to fetch published modules' });
  }
});

// Payment routes (when accessed via /api/payments)
router.post('/', (req, res) => {
  try {
    const { userId, amount, status = 'pending' } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ error: 'User ID and amount are required' });
    }
    
    console.log('Creating payment:', { userId, amount, status });
    
    const newPayment = {
      id: payments.length + 1,
      user_id: userId,
      amount,
      status,
      created_at: new Date().toISOString()
    };
    
    payments.push(newPayment);
    console.log('Payment created:', newPayment);
    res.status(201).json(newPayment);
    
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, razorpayPaymentId } = req.body;
    
    console.log('Updating payment status:', { id, status, razorpayPaymentId });
    
    const paymentIndex = payments.findIndex(payment => payment.id == id);
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    payments[paymentIndex].status = status;
    payments[paymentIndex].razorpay_payment_id = razorpayPaymentId;
    payments[paymentIndex].updated_at = new Date().toISOString();
    
    console.log('Payment status updated:', payments[paymentIndex]);
    res.json(payments[paymentIndex]);
    
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

module.exports = router;