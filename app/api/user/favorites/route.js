import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Gym from '@/models/Gym'; // needed for population
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
    const { gymId } = await request.json();

    if (!gymId) return NextResponse.json({ error: 'gymId required' }, { status: 400 });

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Convert gymId to ObjectId for proper comparison
    const gymObjectId = new mongoose.Types.ObjectId(gymId);
    const isFav = user.favoriteGyms.some(id => id.toString() === gymObjectId.toString());
    
    if (isFav) {
      user.favoriteGyms = user.favoriteGyms.filter(id => id.toString() !== gymObjectId.toString());
    } else {
      user.favoriteGyms.push(gymObjectId);
    }
    await user.save();

    return NextResponse.json({ success: true, isFavorite: !isFav });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
