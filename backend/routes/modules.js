const express = require('express');
const router = express.Router();
const { pool, testConnection } = require('../config/database');

// In-memory storage as fallback
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

let useDatabase = false;

// Initialize database connection
(async () => {
  useDatabase = await testConnection();
})();

// Get all modules
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all modules');
    
    if (useDatabase) {
      try {
        const result = await pool.query('SELECT * FROM modules ORDER BY order_num');
        console.log('Modules fetched from database, count:', result.rows.length);
        return res.json(result.rows);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    console.log('Modules fetched from memory, count:', modules.length);
    res.json(modules);
    
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch modules', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get published modules only
router.get('/published', async (req, res) => {
  try {
    console.log('Fetching published modules');
    
    if (useDatabase) {
      try {
        const result = await pool.query('SELECT * FROM modules WHERE is_published = true ORDER BY order_num');
        console.log('Published modules fetched from database, count:', result.rows.length);
        return res.json(result.rows);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const publishedModules = modules.filter(module => module.is_published);
    console.log('Published modules fetched from memory, count:', publishedModules.length);
    res.json(publishedModules);
    
  } catch (error) {
    console.error('Error fetching published modules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch published modules', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create module
router.post('/', async (req, res) => {
  try {
    const { title, description, videoUrl, pdfUrl, order, isPublished } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    console.log('Creating module:', { title, description, videoUrl, pdfUrl, order, isPublished });
    
    if (useDatabase) {
      try {
        const result = await pool.query(
          'INSERT INTO modules (title, description, video_url, pdf_url, order_num, is_published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [title, description, videoUrl, pdfUrl, order || modules.length + 1, isPublished || false]
        );
        
        console.log('Module created in database:', result.rows[0]);
        return res.status(201).json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const newModule = {
      id: modules.length + 1,
      title,
      description,
      video_url: videoUrl,
      pdf_url: pdfUrl,
      order_num: order || modules.length + 1,
      is_published: isPublished || false,
      created_at: new Date().toISOString()
    };
    
    modules.push(newModule);
    console.log('Module created in memory:', newModule);
    res.status(201).json(newModule);
    
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ 
      error: 'Failed to create module', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update module
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, pdfUrl, order, isPublished } = req.body;
    
    console.log('Updating module:', { id, title, description, videoUrl, pdfUrl, order, isPublished });
    
    if (useDatabase) {
      try {
        const result = await pool.query(
          'UPDATE modules SET title = $1, description = $2, video_url = $3, pdf_url = $4, order_num = $5, is_published = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
          [title, description, videoUrl, pdfUrl, order, isPublished, id]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Module not found' });
        }
        
        console.log('Module updated in database:', result.rows[0]);
        return res.json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const moduleIndex = modules.findIndex(module => module.id == id);
    if (moduleIndex === -1) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      title,
      description,
      video_url: videoUrl,
      pdf_url: pdfUrl,
      order_num: order,
      is_published: isPublished,
      updated_at: new Date().toISOString()
    };
    
    console.log('Module updated in memory:', modules[moduleIndex]);
    res.json(modules[moduleIndex]);
    
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ 
      error: 'Failed to update module', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete module
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting module:', id);
    
    if (useDatabase) {
      try {
        const result = await pool.query('DELETE FROM modules WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Module not found' });
        }
        
        console.log('Module deleted from database:', result.rows[0]);
        return res.json(result.rows[0]);
      } catch (dbError) {
        console.error('Database error, falling back to memory:', dbError.message);
        useDatabase = false;
      }
    }
    
    // Fallback to in-memory storage
    const moduleIndex = modules.findIndex(module => module.id == id);
    if (moduleIndex === -1) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    const deletedModule = modules.splice(moduleIndex, 1)[0];
    console.log('Module deleted from memory:', deletedModule);
    res.json(deletedModule);
    
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ 
      error: 'Failed to delete module', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;