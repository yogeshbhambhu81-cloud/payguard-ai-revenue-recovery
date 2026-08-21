const mongoose = require('mongoose');

const connectDB = async () => {
  const isDemoMode = process.env.DEMO_MODE === 'true';
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/payguard';

  try {
    console.log(`Connecting to MongoDB at ${mongoURI}...`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connected successfully.');
  } catch (error) {
    if (isDemoMode) {
      console.warn('Local MongoDB connection failed. DEMO_MODE=true is active. Initializing MongoMemoryServer fallback...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`MongoMemoryServer started and connected at ${memoryUri}`);
      } catch (memErr) {
        console.error('Failed to launch MongoMemoryServer:', memErr.message);
        process.exit(1);
      }
    } else {
      console.error('==================================================');
      console.error('MONGODB CONNECTION ERROR:');
      console.error(error.message);
      console.error('Please ensure local MongoDB is running at ' + mongoURI + ' or set DEMO_MODE=true in server/.env');
      console.error('==================================================');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
