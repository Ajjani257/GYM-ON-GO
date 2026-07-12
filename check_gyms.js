import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
mongoose.connect(process.env.MONGODB_URI);

const GymSchema = new mongoose.Schema({
  name: String,
  city: String,
  address: String,
}, { collection: 'venues', strict: false });
const Venue = mongoose.models.Venue || mongoose.model('Venue', GymSchema);

async function check() {
  const venues = await Venue.find();
  console.log(`Found ${venues.length} venues.`);
  venues.forEach(g => console.log(`${g.name} - ${g.city}`));
  process.exit(0);
}

check();
