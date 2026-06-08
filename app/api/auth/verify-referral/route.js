import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Code parameter is required' }, { status: 400 });
    }

    const referrer = await User.findOne({ referralCode: code.trim().toUpperCase() });
    if (!referrer) {
      return NextResponse.json({ valid: false, error: 'Invalid referral code' });
    }

    return NextResponse.json({
      valid: true,
      referrerName: referrer.name
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
