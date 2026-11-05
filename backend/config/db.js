const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auth_db';

  try {
    const connection = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
