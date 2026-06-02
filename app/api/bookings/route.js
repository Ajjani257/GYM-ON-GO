import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const filter = { userId };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter).sort({ date: -1 });
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, gymId, date, timeSlot, price, gymName, gymAddress } = body;

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if ((user.walletBalance || 0) < price) {
      return NextResponse.json({ error: 'Insufficient wallet balance. Please add funds.' }, { status: 400 });
    }

    const existing = await Booking.findOne({ gymId, date, timeSlot, userId, status: 'upcoming' });
    if (existing) {
      return NextResponse.json({ error: 'You already booked this slot' }, { status: 400 });
    }

    user.walletBalance -= price;
    await user.save();

    const booking = await Booking.create({
      userId, gymId, date, timeSlot, price, gymName, gymAddress, status: 'upcoming'
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, newDate, newTimeSlot } = body;

    if (!id || !newDate || !newTimeSlot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const existing = await Booking.findOne({ gymId: booking.gymId, date: newDate, timeSlot: newTimeSlot, userId: booking.userId, status: 'upcoming' });
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
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Booking id required' }, { status: 400 });

    // Refund wallet
    const booking = await Booking.findById(id);
    if (booking && booking.status === 'upcoming') {
      const user = await User.findById(booking.userId);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + booking.price;
        await user.save();
      }
    }

    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    return NextResponse.json({ message: 'Booking cancelled' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
