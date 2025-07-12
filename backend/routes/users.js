const express = require('express');
const router = express.Router();
const { pool, testConnection } = require('../config/database');

// In-memory storage as fallback
let users = [];
let useDatabase = false;

// Initialize database connection
(async () => {
  useDatabase = await testConnection();
})();

// Create user
router.post('/', async (req, res) => {
  try {
    const { id, email, role = 'student' } = req.body;
    
    if (!id || !email) {
      return res.status(400).json({ error: 'ID and email are required' });
    }
    
    console.log('Creating user:', { id, email, role });
    
    if (useDatabase) {
      try {
        // Check if user exists in database
        const existingUser = await pool.query('SELECT * FROM users WHERE id = $1 OR email = $2', [id, email]);
        
        if (existingUser.rows.length > 0) {
          console.log('User already exists in database');
          return res.json(existingUser.rows[0]);
        }
        
        // Create new user in database
        const result = await pool.query(
          'INSERT INTO users (id, email, role, has_access, progress) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [id, email, role, false, JSON.stringify({})]
        );
        
        console.log('User created in database:', result.rows[0]);
        return res.json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const existingUser = users.find(user => user.id === id || user.email === email);
    if (existingUser) {
      console.log('User already exists in memory');
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
    console.log('User created in memory:', newUser);
    res.json(newUser);
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching user with ID:', id);
    
    if (useDatabase) {
      try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
          console.log('User not found in database');
          return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('User found in database:', result.rows[0]);
        return res.json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const user = users.find(user => user.id === id);
    
    if (!user) {
      console.log('User not found in memory');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found in memory:', user);
    res.json(user);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update user access
router.patch('/:id/access', async (req, res) => {
  try {
    const { id } = req.params;
    const { hasAccess } = req.body;
    
    console.log('Updating user access:', { id, hasAccess });
    
    if (useDatabase) {
      try {
        const result = await pool.query(
          'UPDATE users SET has_access = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [hasAccess, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('User access updated in database:', result.rows[0]);
        return res.json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].has_access = hasAccess;
    users[userIndex].updated_at = new Date().toISOString();
    
    console.log('User access updated in memory:', users[userIndex]);
    res.json(users[userIndex]);
    
  } catch (error) {
    console.error('Error updating user access:', error);
    res.status(500).json({ 
      error: 'Failed to update user access', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update user progress
router.patch('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    
    console.log('Updating user progress:', { id, progress });
    
    if (useDatabase) {
      try {
        const result = await pool.query(
          'UPDATE users SET progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          [JSON.stringify(progress), id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('User progress updated in database:', result.rows[0]);
        return res.json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    users[userIndex].progress = progress;
    users[userIndex].updated_at = new Date().toISOString();
    
    console.log('User progress updated in memory:', users[userIndex]);
    res.json(users[userIndex]);
    
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({ 
      error: 'Failed to update user progress', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all users');
    
    if (useDatabase) {
      try {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        console.log('Users fetched from database, count:', result.rows.length);
        return res.json(result.rows);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    console.log('Users fetched from memory, count:', users.length);
    res.json(users);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;