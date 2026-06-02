import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import User from './models/User.js';

async function testApi() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({});
  if (users.length === 0) {
    console.log('No users found.');
    process.exit(1);
  }
  const testUser = users[0];
  const userId = testUser._id.toString();
  console.log(`Testing with user ${userId}, current balance: ${testUser.walletBalance || 0}`);

  // Call POST API
  const postRes = await fetch('http://localhost:3000/api/user/wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount: 500 })
  });
  console.log('POST status:', postRes.status);
  console.log('POST body:', await postRes.text());

  // Call GET API
  const getRes = await fetch(`http://localhost:3000/api/user/wallet?userId=${userId}`);
  console.log('GET status:', getRes.status);
  console.log('GET body:', await getRes.text());

  // Check DB directly
  const freshUser = await User.findById(userId);
  console.log('Fresh DB balance:', freshUser.walletBalance);

  process.exit(0);
}

testApi();
