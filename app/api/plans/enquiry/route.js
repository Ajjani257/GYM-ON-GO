import dbConnect from '@/lib/mongodb';
import PlanEnquiry from '@/models/PlanEnquiry';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, planType, orgSize, phone, message } = await request.json();

    if (!name || !email || !planType) {
      return NextResponse.json({ error: 'Name, email and plan type are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const enquiry = await PlanEnquiry.create({ name, email, planType, orgSize, phone, message });

    return NextResponse.json({ success: true, id: enquiry._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
