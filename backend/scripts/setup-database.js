const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres', // Connect to default database first
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create database if it doesn't exist
    try {
      await pool.query(`CREATE DATABASE ${process.env.DB_NAME || 'course_platform'}`);
      console.log('Database created successfully');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('Database already exists');
      } else {
        throw error;
      }
    }
    
    // Connect to the actual database
    const dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'course_platform',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });
    
    // Create tables
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'student',
        has_access BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_url VARCHAR(500),
        order_index INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2),
        status VARCHAR(50) DEFAULT 'pending',
        stripe_payment_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample data
    await dbPool.query(`
      INSERT INTO modules (title, description, video_url, order_index) 
      VALUES 
        ('Introduction to React', 'Learn the basics of React', 'https://example.com/video1', 1),
        ('State Management', 'Understanding state in React', 'https://example.com/video2', 2),
        ('Advanced Patterns', 'Advanced React patterns', 'https://example.com/video3', 3)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Database setup completed successfully');
    await dbPool.end();
    await pool.end();
    
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();