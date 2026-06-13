require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function restore() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const result = await mongoose.connection.collection('partners').updateMany(
    { status: 'approved' },
    { $set: { status: 'pending' } }
  );
  
  console.log(`Reverted ${result.modifiedCount} approved applications back to pending.`);
  process.exit(0);
}

restore();
