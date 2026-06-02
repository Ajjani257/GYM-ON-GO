import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ walletBalance: user.walletBalance || 0 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, amount } = await request.json();

    if (!userId || !amount) return NextResponse.json({ error: 'userId and amount required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.walletBalance = (user.walletBalance || 0) + Number(amount);
    await user.save();

    return NextResponse.json({ success: true, walletBalance: user.walletBalance });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
