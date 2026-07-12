require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const apps = await mongoose.connection.collection('partners').find({}).toArray();
  console.log('Applications:', apps.map(a => ({ id: a._id, name: a.venueName, status: a.status })));
  
  const venues = await mongoose.connection.collection('venues').find({}).toArray();
  console.log('Venues:', venues.map(g => ({ id: g._id, name: g.name })));
  
  process.exit(0);
}

test();
