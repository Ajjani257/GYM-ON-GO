import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const referrals = await User.find({ referredBy: session.user.id })
      .select('name email totalWorkouts referralClaimed createdAt')
      .sort({ createdAt: -1 });

    const formatted = referrals.map(r => ({
      id: r._id,
      name: r.name,
      email: maskEmail(r.email),
      status: r.totalWorkouts > 0 || r.referralClaimed ? 'completed' : 'pending',
      joinedAt: r.createdAt
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
