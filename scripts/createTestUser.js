import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config({ path: '.env.local' });

async function createTestUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  let testUser = await User.findOne({ email: 'test@example.com' });
  if (!testUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      name: 'John Doe',
      email: 'test@example.com',
      password: hashedPassword,
      walletBalance: 2000,
    });
    console.log('Test user created.');
  } else {
    console.log('Test user already exists.');
    testUser.walletBalance = 2000;
    await testUser.save();
  }
  process.exit(0);
}
createTestUser();
