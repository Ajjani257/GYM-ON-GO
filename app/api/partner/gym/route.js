import dbConnect from '@/lib/mongodb';
import Gym from '@/models/Gym';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'partner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let gym = await Gym.findOne({ ownerId: session.user.id });
    if (!gym) {
      // Auto-create a default gym profile so the dashboard has initial state
      gym = await Gym.create({
        name: 'Iron Temple Gym',
        address: 'Sector 5, HSR Layout',
        city: 'Bengaluru',
        description: 'Update your gym profile description, list certified equipment, select amenities, and define dynamic slots in settings.',
        pricePerHour: 120,
        rating: 5.0,
        reviewCount: 0,
        hours: '06:00 - 22:00',
        ownerId: session.user.id,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        amenities: ['AC', 'Parking', 'Shower', 'Locker'],
        equipment: ['Treadmill', 'Dumbbells', 'Bench Press', 'Squat Rack'],
        slots: [
          { time: '06:00 - 07:00', capacity: 15 },
          { time: '07:00 - 08:00', capacity: 15 },
          { time: '08:00 - 09:00', capacity: 15 },
          { time: '09:00 - 10:00', capacity: 15 },
          { time: '17:00 - 18:00', capacity: 15 },
          { time: '18:00 - 19:00', capacity: 15 },
          { time: '19:00 - 20:00', capacity: 15 },
          { time: '20:00 - 21:00', capacity: 15 }
        ],
        pricingRules: []
      });
    }
    return NextResponse.json(gym);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'partner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, city, description, pricePerHour, hours, amenities, equipment, slots, pricingRules } = body;

    const gym = await Gym.findOneAndUpdate(
      { ownerId: session.user.id },
      { 
        name, 
        address, 
        city, 
        description, 
        pricePerHour: Number(pricePerHour), 
        hours, 
        amenities, 
        equipment, 
        slots, 
        pricingRules 
      },
      { new: true, runValidators: true }
    );

    if (!gym) {
      return NextResponse.json({ error: 'Gym profile not found' }, { status: 404 });
    }

    return NextResponse.json(gym);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
