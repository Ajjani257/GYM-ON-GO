import dbConnect from '@/lib/mongodb';
import Gym from '@/models/Gym';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;
    const { priority } = await request.json();

    if (priority === undefined || isNaN(Number(priority))) {
      return NextResponse.json({ error: 'Valid priority value is required' }, { status: 400 });
    }

    const gym = await Gym.findByIdAndUpdate(
      id,
      { priority: Number(priority) },
      { new: true }
    );

    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Priority updated successfully', gym });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
