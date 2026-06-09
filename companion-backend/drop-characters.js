import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/companion-app')
  .then(async () => {
    await mongoose.connection.collection('characters').deleteMany({});
    console.log("Characters dropped!");
    process.exit(0);
  });
