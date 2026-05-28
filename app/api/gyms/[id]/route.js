import dbConnect from '@/lib/mongodb';
import Gym from '@/models/Gym';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const gym = await Gym.findById(id);
    if (!gym) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(gym);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
