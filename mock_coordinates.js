import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
mongoose.connect(process.env.MONGODB_URI);

const GymSchema = new mongoose.Schema({
  name: String,
  city: String,
  location: {
    lat: Number,
    lng: Number
  }
}, { collection: 'venues', strict: false });
const Venue = mongoose.models.Venue || mongoose.model('Venue', GymSchema);

// Approximate city centers
const CITY_CENTERS = {
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
};

async function migrate() {
  const venues = await Venue.find();
  
  for (const gym of venues) {
    let center = CITY_CENTERS[gym.city];
    if (!center) {
      // Default to Mumbai if city not found
      center = CITY_CENTERS['Mumbai'];
    }

    // Add a random small offset (approx 1-5 km)
    // 1 degree is approx 111 km, so 0.01 deg is approx 1.1 km
    const latOffset = (Math.random() - 0.5) * 0.1; // +/- 5km roughly
    const lngOffset = (Math.random() - 0.5) * 0.1;

    gym.location = {
      lat: center.lat + latOffset,
      lng: center.lng + lngOffset
    };

    await gym.save();
    console.log(`Assigned coordinates for ${gym.name} in ${gym.city}: [${gym.location.lat}, ${gym.location.lng}]`);
  }

  console.log('Migration complete.');
  process.exit(0);
}

migrate();
