import dbConnect from '@/lib/mongodb';
import Gym from '@/models/Gym';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    let query = {};
    const city = searchParams.get('city');
    const crowd = searchParams.get('crowd');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

    if (city) query.city = city;
    if (crowd) query.crowdLevel = crowd;
    if (maxPrice) query.pricePerHour = { $lte: Number(maxPrice) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const gyms = await Gym.find(query).sort({ rating: -1 });
    return NextResponse.json(gyms);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
