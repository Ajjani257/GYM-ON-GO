import dbConnect from '@/lib/mongodb';
import Gym from '@/models/Gym';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    let query = {};
    const city = searchParams.get('city');
    const crowd = searchParams.get('crowd');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const equip = searchParams.get('equipment');

    if (city) query.city = city;
    if (crowd) query.crowdLevel = crowd;
    if (maxPrice) query.pricePerHour = { $lte: Number(maxPrice) };
    if (equip) query.equipment = { $all: equip.split(',') };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const gyms = await Gym.find(query);
    gyms.sort((a, b) => {
      const pA = a.priority || 0;
      const pB = b.priority || 0;
      
      // Both have custom positions set
      if (pA > 0 && pB > 0) return pA - pB; 
      
      // Only A has custom position set
      if (pA > 0) return -1; 
      
      // Only B has custom position set
      if (pB > 0) return 1; 
      
      // Fallback: sort by rating descending
      return b.rating - a.rating;
    });
    return NextResponse.json(gyms);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
