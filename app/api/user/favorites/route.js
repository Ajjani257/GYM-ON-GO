import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Venue from '@/models/Venue'; // needed for population
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(session.user.id).populate('favoriteGyms');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user.favoriteGyms);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { venueId } = await request.json();

    if (!venueId) return NextResponse.json({ error: 'venueId required' }, { status: 400 });

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Validate and convert venueId to ObjectId for proper comparison
    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return NextResponse.json({ error: 'Invalid gym ID' }, { status: 400 });
    }

    const gymObjectId = new mongoose.Types.ObjectId(venueId);
    const isFav = user.favoriteGyms.some(id => id.toString() === gymObjectId.toString());
    
    if (isFav) {
      user.favoriteGyms = user.favoriteGyms.filter(id => id.toString() !== gymObjectId.toString());
    } else {
      user.favoriteGyms.push(gymObjectId);
    }
    await user.save();

    return NextResponse.json({ success: true, isFavorite: !isFav });
  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
