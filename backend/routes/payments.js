const express = require('express');
const router = express.Router();
const { pool, testConnection } = require('../config/database');

// In-memory storage as fallback
let payments = [];
let useDatabase = false;

// Initialize database connection
(async () => {
  useDatabase = await testConnection();
})();

// Create payment
router.post('/', async (req, res) => {
  try {
    const { userId, amount, status = 'pending' } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ error: 'User ID and amount are required' });
    }
    
    console.log('Creating payment:', { userId, amount, status });
    
    if (useDatabase) {
      try {
        const result = await pool.query(
          'INSERT INTO payments (user_id, amount, status) VALUES ($1, $2, $3) RETURNING *',
          [userId, amount, status]
        );
        
        console.log('Payment created in database:', result.rows[0]);
        return res.status(201).json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const newPayment = {
      id: payments.length + 1,
      user_id: userId,
      amount,
      status,
      created_at: new Date().toISOString()
    };
    
    payments.push(newPayment);
    console.log('Payment created in memory:', newPayment);
    res.status(201).json(newPayment);
    
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ 
      error: 'Failed to create payment', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update payment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, razorpayPaymentId } = req.body;
    
    console.log('Updating payment status:', { id, status, razorpayPaymentId });
    
    if (useDatabase) {
      try {
        const result = await pool.query(
          'UPDATE payments SET status = $1, razorpay_payment_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
          [status, razorpayPaymentId, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Payment not found' });
        }
        
        console.log('Payment status updated in database:', result.rows[0]);
        return res.json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const paymentIndex = payments.findIndex(payment => payment.id == id);
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    payments[paymentIndex].status = status;
    payments[paymentIndex].razorpay_payment_id = razorpayPaymentId;
    payments[paymentIndex].updated_at = new Date().toISOString();
    
    console.log('Payment status updated in memory:', payments[paymentIndex]);
    res.json(payments[paymentIndex]);
    
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ 
      error: 'Failed to update payment status', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get payments by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching payments for user:', userId);
    
    if (useDatabase) {
      try {
        const result = await pool.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        console.log('User payments fetched from database, count:', result.rows.length);
        return res.json(result.rows);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const userPayments = payments.filter(payment => payment.user_id === userId);
    console.log('User payments fetched from memory, count:', userPayments.length);
    res.json(userPayments);
    
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user payments', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all payments (admin only)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all payments');
    
    if (useDatabase) {
      try {
        const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
        console.log('Payments fetched from database, count:', result.rows.length);
        return res.json(result.rows);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    console.log('Payments fetched from memory, count:', payments.length);
    res.json(payments);
    
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payments', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;