import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Gym from '@/models/Gym';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const gymId = searchParams.get('gymId');

    if (!gymId) return NextResponse.json({ error: 'gymId required' }, { status: 400 });

    const reviews = await Review.find({ gymId }).populate('userId', 'name').sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { gymId, rating, comment } = await request.json();

    if (!gymId || !rating || !comment) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const review = await Review.create({ userId: session.user.id, gymId, rating, comment });

    // Update gym average rating
    const gym = await Gym.findById(gymId);
    if (gym) {
      const allReviews = await Review.find({ gymId });
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      gym.rating = Number((totalRating / allReviews.length).toFixed(1));
      gym.reviewCount = allReviews.length;
      await gym.save();
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
