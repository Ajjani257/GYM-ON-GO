import { getBookings, createBooking, findBooking } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const bookings = await getBookings(userId, status);
  return NextResponse.json(bookings);
}

export async function POST(request) {
  const body = await request.json();
  const { userId, gymId, date, timeSlot, price, gymName, gymAddress } = body;

  const existing = await findBooking({ gymId, date, timeSlot, userId, status: 'upcoming' });
  if (existing) {
    return NextResponse.json({ error: 'You already booked this slot' }, { status: 400 });
  }

  const booking = await createBooking({
    userId, gymId, date, timeSlot, price, gymName, gymAddress, status: 'upcoming'
  });

  return NextResponse.json(booking, { status: 201 });
}
