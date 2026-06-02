import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Gym from '../models/Gym.js';

async function fixImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Update Cult.fit
  const cultGym = await Gym.findOne({ name: 'cult.fit Indiranagar' });
  if (cultGym) {
    // A modern fitness studio with ropes/boxing bags aesthetic
    cultGym.image = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80'; 
    await cultGym.save();
    console.log('Updated Cult.fit image');
  }

  // Update Gold's Gym
  const goldsGym = await Gym.findOne({ name: "Gold's Gym Lower Parel" });
  if (goldsGym) {
    // A heavy weightlifting / dumbbell rack aesthetic
    goldsGym.image = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'; 
    await goldsGym.save();
    console.log('Updated Gold\'s Gym image');
  }

  process.exit(0);
}

fixImages();
