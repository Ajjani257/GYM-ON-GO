import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ eligible: false, userReview: null });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const gymId = searchParams.get('gymId');

    if (!gymId) {
      return NextResponse.json({ error: 'gymId required' }, { status: 400 });
    }

    // Check if the user has a completed booking at the gym (finished workout)
    const hasBooked = await Booking.findOne({
      userId: session.user.id,
      gymId,
      status: 'completed'
    });

    // Find if the user has already written a review for this gym
    const userReview = await Review.findOne({
      userId: session.user.id,
      gymId
    });

    return NextResponse.json({
      eligible: !!hasBooked,
      userReview
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
