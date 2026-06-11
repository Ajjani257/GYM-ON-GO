import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let filter = {};
    if (session.user.role === 'partner') {
      const Gym = (await import('@/models/Gym')).default;
      const gym = await Gym.findOne({ ownerId: session.user.id });
      if (gym) {
        filter.gymId = gym._id;
      } else {
        return NextResponse.json([]);
      }
    } else {
      filter.userId = session.user.id;
    }

    if (status) filter.status = status;

    const bookings = await Booking.find(filter).populate('userId', 'name email').sort({ date: -1 });

    // Auto-transition past bookings to 'completed'
    const now = new Date();
    for (let b of bookings) {
      if (b.status === 'upcoming') {
        const endTimeStr = b.timeSlot.split(' - ')[1] || '23:59';
        const endDate = new Date(`${b.date}T${endTimeStr}:00`);
        if (endDate < now) {
          b.status = 'completed';
          await b.save();
        }
      }
    }

    // Since we updated them in memory, we might need to filter again if the user requested a specific status
    let finalBookings = bookings;
    if (status) {
      finalBookings = bookings.filter(b => b.status === status);
    }

    return NextResponse.json(finalBookings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const { gymId, date, timeSlot, price, gymName, gymAddress } = body;

    if (!gymId || !date || !timeSlot || price === undefined || !gymName || !gymAddress) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 });
    }

    // Validate Date is not in the past
    const bookDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookDate < today) {
      return NextResponse.json({ error: 'Cannot book slots in the past' }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if ((user.walletBalance || 0) < price) {
      return NextResponse.json({ error: 'Insufficient wallet balance. Please add funds.' }, { status: 400 });
    }

    const existing = await Booking.findOne({ gymId, date, timeSlot, userId: session.user.id, status: 'upcoming' });
    if (existing) {
      return NextResponse.json({ error: 'You already booked this slot' }, { status: 400 });
    }

    user.walletBalance -= price;
    await user.save();

    const booking = await Booking.create({
      userId: session.user.id, gymId, date, timeSlot, price, gymName, gymAddress, status: 'upcoming'
    });

    await Transaction.create({
      userId: session.user.id,
      type: 'debit',
      amount: price,
      description: `Booked session at ${gymName}`
    });

    // Award loyalty points: +10 per booking
    const POINTS_PER_BOOKING = 10;
    const POINTS_THRESHOLD = 100;
    const REWARD_AMOUNT = 50;

    user.loyaltyPoints = (user.loyaltyPoints || 0) + POINTS_PER_BOOKING;
    user.lifetimePoints = (user.lifetimePoints || 0) + POINTS_PER_BOOKING;

    // Auto-redeem every 100 points into ₹50 wallet credit
    const redeemable = Math.floor(user.loyaltyPoints / POINTS_THRESHOLD);
    if (redeemable > 0) {
      const rewardCredit = redeemable * REWARD_AMOUNT;
      user.walletBalance = (user.walletBalance || 0) + rewardCredit;
      user.loyaltyPoints -= redeemable * POINTS_THRESHOLD;
      await Transaction.create({
        userId: session.user.id,
        type: 'credit',
        amount: rewardCredit,
        description: `Loyalty reward: ${redeemable * POINTS_THRESHOLD} pts → ₹${rewardCredit} wallet credit`,
      });
    }
    await user.save();

    return NextResponse.json({ ...booking.toObject(), loyaltyPoints: user.loyaltyPoints, rewardEarned: redeemable > 0 ? redeemable * REWARD_AMOUNT : 0 }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await request.json();
    const { id, newDate, newTimeSlot } = body;

    if (!id || !newDate || !newTimeSlot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bookDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookDate < today) {
      return NextResponse.json({ error: 'Cannot reschedule to a past date' }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.userId !== session.user.id) return NextResponse.json({ error: 'Unauthorized to modify this booking' }, { status: 403 });

    const existing = await Booking.findOne({ gymId: booking.gymId, date: newDate, timeSlot: newTimeSlot, userId: session.user.id, status: 'upcoming' });
    if (existing) {
      return NextResponse.json({ error: 'You already booked this new slot' }, { status: 400 });
    }

    booking.date = newDate;
    booking.timeSlot = newTimeSlot;
    await booking.save();

    return NextResponse.json(booking);
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
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Booking id required' }, { status: 400 });

    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (booking.userId !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    if (booking.status !== 'upcoming') return NextResponse.json({ error: 'Only upcoming bookings can be cancelled' }, { status: 400 });

    // Refund wallet
    const user = await User.findById(session.user.id);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + booking.price;
      await user.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    await Transaction.create({
      userId: session.user.id,
      type: 'credit',
      amount: booking.price,
      description: `Refund for cancelled session at ${booking.gymName}`
    });

    return NextResponse.json({ message: 'Booking cancelled' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
