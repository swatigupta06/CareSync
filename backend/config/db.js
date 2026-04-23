const mongoose = require('mongoose');

/**
 * Establishes a MongoDB connection using Mongoose.
 * Retries on failure are handled by Mongoose's built-in reconnect.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/caresync';

  try {
    const conn = await mongoose.connect(mongoURI, {
      // Mongoose 7+ has these defaults, but explicit is safer
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} — DB: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1); // Exit with failure so process manager can restart
  }

  // Log disconnection events in development
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });
};

module.exports = connectDB;
