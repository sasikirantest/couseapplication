const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database schema...');
    
    const schemaSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY, -- Firebase UID
          email VARCHAR(255) UNIQUE NOT NULL,
          role VARCHAR(50) DEFAULT 'student',
          has_access BOOLEAN DEFAULT false,
          progress JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Course modules table
      CREATE TABLE IF NOT EXISTS modules (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          video_url TEXT,
          pdf_url TEXT,
          order_num INTEGER NOT NULL,
          is_published BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Payments table
      CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) REFERENCES users(id),
          amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          razorpay_payment_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_modules_order ON modules(order_num);
      CREATE INDEX IF NOT EXISTS idx_modules_published ON modules(is_published);
      CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `;

    await pool.query(schemaSQL);
    console.log('✅ Database schema setup completed successfully!');
    
    // Insert sample modules if they don't exist
    const moduleCheck = await pool.query('SELECT COUNT(*) FROM modules');
    if (parseInt(moduleCheck.rows[0].count) === 0) {
      console.log('📚 Adding sample modules...');
      
      const sampleModules = `
        INSERT INTO modules (title, description, video_url, pdf_url, order_num, is_published) VALUES
        ('Introduction to AI', 'Learn the fundamentals of Artificial Intelligence', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://example.com/notes1.pdf', 1, true),
        ('Machine Learning Basics', 'Understanding ML algorithms and concepts', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://example.com/notes2.pdf', 2, true),
        ('Deep Learning Fundamentals', 'Dive into neural networks and deep learning', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://example.com/notes3.pdf', 3, true),
        ('Natural Language Processing', 'Explore text processing and language models', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://example.com/notes4.pdf', 4, true),
        ('Computer Vision', 'Learn image processing and object detection', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://example.com/notes5.pdf', 5, true),
        ('AI Ethics & Future', 'Understand responsible AI development', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://example.com/notes6.pdf', 6, true);
      `;
      
      await pool.query(sampleModules);
      console.log('✅ Sample modules added successfully!');
    }
    
    // Test the setup
    const result = await pool.query('SELECT COUNT(*) FROM modules');
    console.log(`📊 Found ${result.rows[0].count} modules in database`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();