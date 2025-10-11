// scripts/init-db.js
require('dotenv').config({ path: '.env.local' }); // Add this line at the top!
const { sql } = require('@vercel/postgres');

async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS email_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(50) DEFAULT 'post-study',
        is_active BOOLEAN DEFAULT true,
        unsubscribe_token VARCHAR(255) UNIQUE
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_email ON email_subscribers(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_token ON email_subscribers(unsubscribe_token)`;

    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

initDatabase();