// database/test.js
import getConnection from './db.js';

async function testConnection() {
  try {
    const connection = await getConnection();
    console.log('Connection test successful!');
    await connection.end();
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();