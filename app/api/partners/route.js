import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Simple schema for partner applications
const partnerSchema = new mongoose.Schema({
  gymName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

const Partner = mongoose.models.Partner || mongoose.model('Partner', partnerSchema);

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { gymName, ownerName, email, phone, city } = body;

    if (!gymName || !ownerName || !email || !phone || !city) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    const phoneClean = phone.replace(/[^0-9+]/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return NextResponse.json({ error: 'Invalid phone number format (must be 10-15 digits)' }, { status: 400 });
    }

    const application = await Partner.create({ gymName, ownerName, email, phone, city });
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

