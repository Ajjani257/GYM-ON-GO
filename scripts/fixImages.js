import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Venue from '../models/Venue.js';

async function fixImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Update Cult.fit
  const cultGym = await Venue.findOne({ name: 'cult.fit Indiranagar' });
  if (cultGym) {
    // A modern fitness studio with ropes/boxing bags aesthetic
    cultGym.image = 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&q=80'; 
    await cultGym.save();
    console.log('Updated Cult.fit image');
  }

  // Update Gold's Venue
  const goldsGym = await Venue.findOne({ name: "Gold's Venue Lower Parel" });
  if (goldsGym) {
    // A heavy weightlifting / dumbbell rack aesthetic
    goldsGym.image = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80'; 
    await goldsGym.save();
    console.log('Updated Gold\'s Venue image');
  }

  process.exit(0);
}

fixImages();
