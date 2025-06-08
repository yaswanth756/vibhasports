// database/db.js
import mysql from 'mysql2/promise';

async function getConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'baofnqhdacxwufloge9q-mysql.services.clever-cloud.com',
      user: process.env.DB_USER || 'uxf1dwkow7ootjs3',
      password: process.env.DB_PASSWORD || 'iNkQjTP5ObFSXA6Xw5D3',
      database: process.env.DB_NAME || 'baofnqhdacxwufloge9q',
    });
    console.log('Database connected successfully!');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export default getConnection;