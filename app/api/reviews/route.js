import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Gym from '@/models/Gym';
import User from '@/models/User';
import Booking from '@/models/Booking';
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

    // 1. Check if the user has a completed booking at the gym (finished workout)
    const hasBooked = await Booking.findOne({
      userId: session.user.id,
      gymId,
      status: 'completed'
    });

    if (!hasBooked) {
      return NextResponse.json({ error: 'You can only review gyms after you have completed a workout there.' }, { status: 403 });
    }

    // 2. Prevent duplicate reviews by the same user for the same gym
    const existingReview = await Review.findOne({
      userId: session.user.id,
      gymId
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this gym. You can edit your existing review instead.' }, { status: 400 });
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

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { reviewId, rating, comment } = await request.json();

    if (!reviewId || !rating || !comment) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Find and update the review, checking ownership
    const review = await Review.findOne({ _id: reviewId, userId: session.user.id });
    if (!review) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Update gym average rating
    const gym = await Gym.findById(review.gymId);
    if (gym) {
      const allReviews = await Review.find({ gymId: review.gymId });
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      gym.rating = Number((totalRating / allReviews.length).toFixed(1));
      gym.reviewCount = allReviews.length;
      await gym.save();
    }

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // Find and delete review, checking ownership
    const review = await Review.findOne({ _id: reviewId, userId: session.user.id });
    if (!review) {
      return NextResponse.json({ error: 'Review not found or unauthorized' }, { status: 404 });
    }

    const gymId = review.gymId;
    await Review.deleteOne({ _id: reviewId });

    // Update gym average rating
    const gym = await Gym.findById(gymId);
    if (gym) {
      const allReviews = await Review.find({ gymId });
      if (allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        gym.rating = Number((totalRating / allReviews.length).toFixed(1));
        gym.reviewCount = allReviews.length;
      } else {
        gym.rating = 5.0; // default back to 5.0
        gym.reviewCount = 0;
      }
      await gym.save();
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
