require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const apps = await mongoose.connection.collection('partners').find({}).toArray();
  console.log('Applications:', apps.map(a => ({ id: a._id, name: a.gymName, status: a.status })));
  
  const gyms = await mongoose.connection.collection('gyms').find({}).toArray();
  console.log('Gyms:', gyms.map(g => ({ id: g._id, name: g.name })));
  
  process.exit(0);
}

test();
