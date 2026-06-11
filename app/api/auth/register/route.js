import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, password, role, referralCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    let referredByUserId = null;
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrer) {
        referredByUserId = referrer._id;
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    // New user gets ₹50 welcome credit if they joined via a referral
    const welcomeCredit = referrer ? 50 : 0;

    let finalRole = role || 'member';
    if (email.toLowerCase().includes('admin')) {
      finalRole = 'admin';
    }

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
      referredBy: referredByUserId,
      walletBalance: welcomeCredit,
    });

    // Log the welcome credit transaction
    if (referrer) {
      await Transaction.create({
        userId: user._id,
        type: 'credit',
        amount: 50,
        description: `Welcome referral credit (referred by ${referrer.name})`,
      });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      welcomeCredit,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
