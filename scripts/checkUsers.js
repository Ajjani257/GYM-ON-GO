import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import User from './models/User.js';

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({});
  console.log(users.map(u => ({ email: u.email, balance: u.walletBalance })));
  process.exit(0);
}
checkUsers();
