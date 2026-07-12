import dbConnect from '@/lib/mongodb';
import Venue from '@/models/Venue';
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

    const targetGym = await Venue.findById(id);
    if (!targetGym) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    const oldPriority = targetGym.priority || 0;
    const newPriority = Number(priority);

    // If new priority is greater than 0, exchange with the gym that currently has it
    if (newPriority > 0 && newPriority !== oldPriority) {
      const swapGym = await Venue.findOne({ priority: newPriority, _id: { $ne: id } });
      if (swapGym) {
        swapGym.priority = oldPriority;
        await swapGym.save();
      }
    }

    targetGym.priority = newPriority;
    await targetGym.save();

    return NextResponse.json({ message: 'Priority updated successfully', gym: targetGym });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
