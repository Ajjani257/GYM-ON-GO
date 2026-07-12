import dbConnect from '@/lib/mongodb';
import Venue from '@/models/Venue';
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
    const category = searchParams.get('category');

    const userLat = searchParams.get('userLat');
    const userLng = searchParams.get('userLng');

    if (city) query.city = city;
    if (crowd) query.crowdLevel = crowd;
    if (maxPrice) query.pricePerHour = { $lte: Number(maxPrice) };
    if (equip) query.equipment = { $all: equip.split(',') };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    let venues = await Venue.find(query);

    // Calculate distance if user location is provided
    if (userLat && userLng) {
      const lat1 = parseFloat(userLat);
      const lon1 = parseFloat(userLng);
      
      const R = 6371; // Radius of the earth in km
      
      venues = venues.map(gym => {
        const gymObj = gym.toObject();
        if (gymObj.location && gymObj.location.lat && gymObj.location.lng) {
          const lat2 = gymObj.location.lat;
          const lon2 = gymObj.location.lng;
          
          const dLat = (lat2 - lat1) * (Math.PI / 180);
          const dLon = (lon2 - lon1) * (Math.PI / 180);
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
          const distance = R * c; // Distance in km
          
          gymObj.distanceKm = Number(distance.toFixed(1));
        } else {
          gymObj.distanceKm = Infinity; // Venue has no location
        }
        return gymObj;
      });
    }

    venues.sort((a, b) => {
      const pA = a.priority || 0;
      const pB = b.priority || 0;
      
      if (pA !== pB) {
        if (pA > 0 && pB > 0) return pA - pB;
        if (pA > 0) return -1;
        if (pB > 0) return 1;
      }
      
      // If user provided location and distances are available, fallback to sorting by distance
      if (userLat && userLng) {
         return a.distanceKm - b.distanceKm;
      }
      
      return b.rating - a.rating;
    });

    return NextResponse.json(venues);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
