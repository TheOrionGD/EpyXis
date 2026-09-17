const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (uri) {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    }
  } catch (error) {
    console.warn(`Primary MongoDB connection failed: ${error.message}. Initializing MongoMemoryServer...`);
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection completely failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

