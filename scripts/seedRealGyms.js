import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We define the schema here since we are running a standalone script
const GymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, default: '' },
  pricePerHour: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  crowdLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
  hours: { type: String, default: '06:00 - 22:00' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  image: { type: String, default: '' },
  amenities: [{ type: String }],
  equipment: [{ type: String }],
  slots: [{
    time: String,
    capacity: { type: Number, default: 20 },
  }],
}, { timestamps: true });

const Gym = mongoose.models.Gym || mongoose.model('Gym', GymSchema);

const realGyms = [
  // AHMEDABAD
  {
    name: 'Anytime Fitness Vastrapur',
    address: 'A-205, Amrapali Lake View Tower, Opp. Hyatt International',
    city: 'Ahmedabad',
    description: 'Premium 24/7 fitness center featuring global access, advanced cardio, and strength training equipment.',
    pricePerHour: 150,
    rating: 4.6,
    reviewCount: 142,
    crowdLevel: 'moderate',
    hours: '24 Hours',
    phone: '079 4004 0000',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    amenities: ['AC', 'Parking', 'Showers', 'Lockers', 'WiFi'],
    equipment: ['Treadmill', 'Squat Rack', 'Dumbbells', 'Bench Press', 'Rowing Machine', 'Cable Machine'],
  },
  {
    name: 'Zeus Fitness Point',
    address: '101–104, 1st Floor, Venus Atlantis, Near Shell Petrol Pump, Prahlad Nagar',
    city: 'Ahmedabad',
    description: 'A spacious, well-equipped facility popular among fitness enthusiasts in Prahlad Nagar.',
    pricePerHour: 120,
    rating: 4.4,
    reviewCount: 89,
    crowdLevel: 'high',
    hours: '06:00 - 22:00',
    phone: '099988 77766',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80',
    amenities: ['AC', 'Showers', 'Lockers', 'Steam Room'],
    equipment: ['Treadmill', 'Dumbbells', 'Bench Press', 'Leg Press'],
  },
  {
    name: 'Appex Gym',
    address: 'Bapunagar Main Road',
    city: 'Ahmedabad',
    description: 'A hardcore, neighborhood-focused gym frequently highlighted for its strong reputation among local lifters.',
    pricePerHour: 80,
    rating: 4.8,
    reviewCount: 204,
    crowdLevel: 'low',
    hours: '05:30 - 21:30',
    phone: '098250 12345',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
    amenities: ['Parking', 'Water Cooler'],
    equipment: ['Squat Rack', 'Bench Press', 'Dumbbells', 'Deadlift Platform'],
  },

  // MUMBAI
  {
    name: 'Nitrro Bespoke Fitness',
    address: 'B-1 Skybay Hubtown, Opposite Benzer, Breach Candy',
    city: 'Mumbai',
    description: 'An ultra-luxury fitness hub with extensive floor space and advanced strength/functional training equipment.',
    pricePerHour: 350,
    rating: 4.9,
    reviewCount: 312,
    crowdLevel: 'moderate',
    hours: '06:00 - 23:00',
    phone: '022 2367 0000',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80',
    amenities: ['Valet Parking', 'Sauna', 'Lounge', 'Cafe', 'Showers'],
    equipment: ['Treadmill', 'Squat Rack', 'Dumbbells', 'Bench Press', 'Rowing Machine', 'Kettlebells'],
  },
  {
    name: 'Gold\'s Gym Lower Parel',
    address: 'One World Center, A-2 Tower 1, 3rd Floor, Lower Parel',
    city: 'Mumbai',
    description: 'A globally recognized brand offering professional training programs and comprehensive fitness equipment.',
    pricePerHour: 200,
    rating: 4.5,
    reviewCount: 450,
    crowdLevel: 'high',
    hours: '06:00 - 22:00',
    phone: '022 4004 5555',
    image: 'https://images.unsplash.com/photo-1593079831268-3381b0c42385?w=800&q=80',
    amenities: ['AC', 'Parking', 'Showers', 'Lockers'],
    equipment: ['Treadmill', 'Elliptical', 'Smith Machine', 'Dumbbells', 'Bench Press'],
  },
  {
    name: 'Waves Gym',
    address: 'Veera Desai Area, Andheri West',
    city: 'Mumbai',
    description: 'A highly-rated local favorite in the Western Suburbs with an energetic environment and great equipment.',
    pricePerHour: 180,
    rating: 4.7,
    reviewCount: 275,
    crowdLevel: 'moderate',
    hours: '06:00 - 23:30',
    phone: '022 6666 7777',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80',
    amenities: ['AC', 'Lockers', 'Juice Bar', 'Showers'],
    equipment: ['Treadmill', 'Squat Rack', 'Dumbbells', 'Bench Press', 'TRX'],
  },

  // BENGALURU
  {
    name: 'cult.fit Indiranagar',
    address: '1st Floor, Above Ritu Kumar, Indiranagar Double Rd, HAL 2nd Stage',
    city: 'Bengaluru',
    description: 'High-energy group workouts including Boxing, HRX, S&C, and Yoga in a state-of-the-art facility.',
    pricePerHour: 250,
    rating: 4.8,
    reviewCount: 890,
    crowdLevel: 'high',
    hours: '06:00 - 22:00',
    phone: '080 4444 3333',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    amenities: ['AC', 'Showers', 'Lockers', 'Smart Check-in'],
    equipment: ['Dumbbells', 'Kettlebells', 'Boxing Bags', 'TRX', 'Rowing Machine'],
  },
  {
    name: 'Aurum Luxury Fitness Club',
    address: '368, 4th Floor, HAL 2nd Stage, 100 Feet Road, Indiranagar',
    city: 'Bengaluru',
    description: 'A premium, luxury fitness experience offering unparalleled aesthetics and elite equipment.',
    pricePerHour: 400,
    rating: 4.9,
    reviewCount: 156,
    crowdLevel: 'low',
    hours: '06:00 - 22:00',
    phone: '080 5555 4444',
    image: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?w=800&q=80',
    amenities: ['Valet Parking', 'Spa', 'Sauna', 'Lounge', 'Premium Showers'],
    equipment: ['Treadmill', 'Squat Rack', 'Bench Press', 'Cable Machine', 'Assault Bike'],
  },
  {
    name: 'Fitness First Whitefield',
    address: 'No. 7, Prime Square, Whitefield Rd',
    city: 'Bengaluru',
    description: 'World-class fitness center in the heart of Whitefield IT hub, perfect for corporate professionals.',
    pricePerHour: 220,
    rating: 4.5,
    reviewCount: 320,
    crowdLevel: 'moderate',
    hours: '06:00 - 23:00',
    phone: '080 6666 5555',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    amenities: ['AC', 'Parking', 'Lockers', 'Showers', 'Towel Service'],
    equipment: ['Treadmill', 'Dumbbells', 'Bench Press', 'Rowing Machine', 'Squat Rack', 'Leg Press'],
  }
];

const standardSlots = [
  { time: '06:00 - 07:00', capacity: 20 },
  { time: '07:00 - 08:00', capacity: 20 },
  { time: '08:00 - 09:00', capacity: 20 },
  { time: '09:00 - 10:00', capacity: 20 },
  { time: '17:00 - 18:00', capacity: 20 },
  { time: '18:00 - 19:00', capacity: 20 },
  { time: '19:00 - 20:00', capacity: 20 },
  { time: '20:00 - 21:00', capacity: 20 },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    await Gym.deleteMany({});
    console.log('Cleared existing dummy gyms.');

    const gymsToInsert = realGyms.map(gym => ({
      ...gym,
      slots: standardSlots,
    }));

    await Gym.insertMany(gymsToInsert);
    console.log(`Successfully seeded ${realGyms.length} real gyms!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding gyms:', error);
    process.exit(1);
  }
}

seed();
