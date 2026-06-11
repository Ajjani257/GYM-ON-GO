import dbConnect from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(30);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
