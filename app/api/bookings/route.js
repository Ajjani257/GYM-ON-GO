import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { NextResponse } from 'next/server';

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

    const existing = await Booking.findOne({ gymId, date, timeSlot, userId, status: 'upcoming' });
    if (existing) {
      return NextResponse.json({ error: 'You already booked this slot' }, { status: 400 });
    }

    const booking = await Booking.create({
      userId, gymId, date, timeSlot, price, gymName, gymAddress, status: 'upcoming'
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
