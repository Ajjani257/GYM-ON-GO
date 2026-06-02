import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Gym from '@/models/Gym'; // needed for population
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await User.findById(userId).populate('favoriteGyms');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user.favoriteGyms);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, gymId } = await request.json();

    if (!userId || !gymId) return NextResponse.json({ error: 'userId and gymId required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isFav = user.favoriteGyms.includes(gymId);
    if (isFav) {
      user.favoriteGyms = user.favoriteGyms.filter(id => id.toString() !== gymId);
    } else {
      user.favoriteGyms.push(gymId);
    }
    await user.save();

    return NextResponse.json({ success: true, isFavorite: !isFav });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
