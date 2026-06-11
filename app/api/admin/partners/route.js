import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import User from '@/models/User';
import Gym from '@/models/Gym';
import { sendSimulatedEmail, getEmailHtmlTemplate } from '@/lib/emailSimulator';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET all applications
export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const applications = await Partner.find().sort({ createdAt: -1 });
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST actions: onboard or reject
export async function POST(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, address, description, pricePerHour, image, amenities, equipment, hours, priority } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing registration ID or action' }, { status: 400 });
    }

    const application = await Partner.findById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (action === 'reject') {
      application.status = 'rejected';
      await application.save();

      // Send simulated rejection email
      await sendSimulatedEmail({
        to: application.email,
        subject: `Gym-on-Go Partner Application Status Update`,
        body: `Hi ${application.ownerName},\n\nThank you for applying to the Gym-on-Go Partner Network.\n\nWe appreciate the time you took to share details about "${application.gymName}". Unfortunately, after reviewing your application against our current network criteria, we are unable to proceed with your onboarding at this time.\n\nThank you for your interest and we wish you the best of luck.\n\nBest regards,\nGym-on-Go Onboarding Team`
      });

      return NextResponse.json({ message: 'Application rejected' });
    }

    if (action === 'onboard') {
      if (!address || !description || !pricePerHour) {
        return NextResponse.json({ error: 'Address, description, and price per hour are required to onboard.' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: application.email });
      if (existingUser) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
      }

      // Generate a temporary password
      const rawPassword = Math.random().toString(36).substring(2, 10);
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // 1. Create Partner User Account
      const partnerUser = await User.create({
        name: application.ownerName,
        email: application.email,
        password: hashedPassword,
        role: 'partner',
        walletBalance: 0,
      });

      // Default Slots Structure
      const defaultSlots = [
        { time: '06:00 - 07:00', capacity: 15 },
        { time: '07:00 - 08:00', capacity: 15 },
        { time: '08:00 - 09:00', capacity: 15 },
        { time: '09:00 - 10:00', capacity: 15 },
        { time: '17:00 - 18:00', capacity: 15 },
        { time: '18:00 - 19:00', capacity: 15 },
        { time: '19:00 - 20:00', capacity: 15 },
        { time: '20:00 - 21:00', capacity: 15 }
      ];

      // 2. Create the Gym Profile in database
      const gym = await Gym.create({
        name: application.gymName,
        address,
        city: application.city,
        description,
        pricePerHour: Number(pricePerHour),
        rating: 5.0,
        reviewCount: 0,
        hours: hours || application.operatingHours || '06:00 - 22:00',
        phone: application.phone,
        email: application.email,
        image: image || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
        amenities: amenities || application.amenities || ['AC', 'Parking', 'Shower', 'Locker'],
        equipment: equipment || application.equipment || ['Treadmill', 'Dumbbells', 'Bench Press', 'Squat Rack'],
        slots: defaultSlots,
        priority: Number(priority || 0),
        ownerId: partnerUser._id,
      });

      // 3. Mark Application as Approved
      application.status = 'approved';
      await application.save();

      // 4. Send welcome email with login credentials in HTML
      const welcomeSubject = `🎉 Welcome to Gym-on-Go! Your Partner Account is Live`;
      const welcomeBody = `Hi ${application.ownerName},\n\nWe are thrilled to welcome "${application.gymName}" to the Gym-on-Go Network!\n\nYour facilities have been verified and your profile is now live.\n\nYour Partner Dashboard Login Credentials:\n- Dashboard URL: http://localhost:3000/auth\n- Username/Email: ${application.email}\n- Temporary Password: ${rawPassword}\n\nPlease log in and change your password. You can manage timing slots, pricing rules, and scan visitor QR codes.\n\nBest regards,\nGym-on-Go Team`;

      const welcomeHtml = getEmailHtmlTemplate({
        title: welcomeSubject,
        contentHtml: `
          <h1>Congratulations ${application.ownerName},</h1>
          <p>We are thrilled to inform you that your application has been approved and <strong>${application.gymName}</strong> is officially live in the Gym-on-Go network!</p>
          <p>Our representative has verified your facility details, and your public profile is now visible to members in the explore section.</p>
          
          <p>Your Gym Partner Dashboard has been successfully created. Please use the secure credentials below to log in and manage your gym profile:</p>
          
          <div class="highlight-box" style="border-left-color: #10b981; background-color: #f0fdf4;">
            <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 14px; color: #065f46; text-transform: uppercase;">Your Login Credentials</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #047857; font-weight: 600; width: 35%;">Dashboard URL</td>
                <td style="padding: 6px 0; color: #065f46;"><a href="http://localhost:3000/auth" style="color: #10b981; text-decoration: underline;">http://localhost:3000/auth</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #047857; font-weight: 600;">Username / Email</td>
                <td style="padding: 6px 0; color: #065f46; font-family: monospace;">${application.email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #047857; font-weight: 600;">Temporary Password</td>
                <td style="padding: 6px 0; color: #065f46; font-family: monospace; font-weight: bold; font-size: 15px;">${rawPassword}</td>
              </tr>
            </table>
          </div>
          
          <h3 style="font-size: 16px; color: #0f172a; margin-top: 24px;">Recommended Next Steps</h3>
          <ul style="padding-left: 20px; margin: 0 0 24px 0; font-size: 14px; line-height: 1.5;">
            <li style="margin-bottom: 10px;"><strong>Change Password</strong>: Log in to your dashboard and immediately update your temporary password for account security.</li>
            <li style="margin-bottom: 10px;"><strong>Manage Timing Slots & Capacity</strong>: Configure your open slots, time-ranges, and maximum visitor capacities for off-peak hours.</li>
            <li style="margin-bottom: 10px;"><strong>Hourly Pricing</strong>: Adjust your pricing tier if you want to run special promotions or change standard hourly rates.</li>
            <li><strong>Scan Check-ins</strong>: Print or display your gym's check-in QR code at your reception. When members scan it using the app, their details will automatically log onto your dashboard and start their workout session.</li>
          </ul>
          
          <div class="btn-container">
            <a href="http://localhost:3000/auth" class="btn-action" style="background-color: #10b981; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">Log In to Partner Dashboard</a>
          </div>
          
          <p>Welcome aboard! We look forward to a successful partnership.</p>
          <p>Sincerely,<br><strong>The Gym-on-Go Team</strong></p>
        `
      });

      await sendSimulatedEmail({
        to: application.email,
        subject: welcomeSubject,
        body: welcomeBody,
        html: welcomeHtml
      });

      return NextResponse.json({
        message: 'Onboarding completed successfully!',
        credentials: {
          email: application.email,
          password: rawPassword,
        },
        gymId: gym._id,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
