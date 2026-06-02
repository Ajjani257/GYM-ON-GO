import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import User from './models/User.js';

async function testWallet() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  let user = await User.findOne({});
  if (!user) {
    console.log('No user found');
    process.exit(1);
  }

  console.log('Initial wallet balance:', user.walletBalance);

  user.walletBalance = (user.walletBalance || 0) + 1000;
  await user.save();
  console.log('Wallet after adding 1000:', user.walletBalance);

  user = await User.findById(user._id);
  console.log('Wallet fetched from DB:', user.walletBalance);

  process.exit(0);
}
testWallet();
