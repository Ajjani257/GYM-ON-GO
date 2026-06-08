import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ 
      walletBalance: user.walletBalance || 0,
      referralCode: user.referralCode,
      referralsCount: user.referralsCount || 0,
      loyaltyPoints: user.loyaltyPoints || 0,
      lifetimePoints: user.lifetimePoints || 0,
      activePass: user.activePass || { passType: 'none', expiresAt: null }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { amount } = await request.json();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    if (numAmount > 10000) return NextResponse.json({ error: 'Maximum top-up amount is ₹10,000' }, { status: 400 });

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.walletBalance = (user.walletBalance || 0) + numAmount;
    await user.save();

    await Transaction.create({
      userId: session.user.id,
      type: 'credit',
      amount: numAmount,
      description: 'Wallet top-up (Mock Razorpay)'
    });

    return NextResponse.json({ success: true, walletBalance: user.walletBalance });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
