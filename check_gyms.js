import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
mongoose.connect(process.env.MONGODB_URI);

const GymSchema = new mongoose.Schema({
  name: String,
  city: String,
  address: String,
}, { collection: 'gyms', strict: false });
const Gym = mongoose.models.Gym || mongoose.model('Gym', GymSchema);

async function check() {
  const gyms = await Gym.find();
  console.log(`Found ${gyms.length} gyms.`);
  gyms.forEach(g => console.log(`${g.name} - ${g.city}`));
  process.exit(0);
}

check();
