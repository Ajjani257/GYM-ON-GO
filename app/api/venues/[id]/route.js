import dbConnect from '@/lib/mongodb';
import Venue from '@/models/Venue';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const gym = await Venue.findById(id);
    if (!gym) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(gym);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;
    const gym = await Venue.findByIdAndDelete(id);
    if (!gym) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });

    return NextResponse.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
