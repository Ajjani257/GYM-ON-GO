import { getGymById } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;
  const gym = await getGymById(id);
  if (!gym) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(gym);
}
