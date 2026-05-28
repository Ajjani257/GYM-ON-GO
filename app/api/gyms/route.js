import { getAllGyms } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {
    city: searchParams.get('city') || '',
    crowd: searchParams.get('crowd') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
  };

  const gyms = await getAllGyms(filters);
  return NextResponse.json(gyms);
}
