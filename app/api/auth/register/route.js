import { findUserByEmail, createUser } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { name, email, password } = await request.json();

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashed });

  return NextResponse.json({
    id: user._id,
    name: user.name,
    email: user.email,
  }, { status: 201 });
}
