import dbConnect from '@/lib/mongodb';
import Partner from '@/models/Partner';
import { sendSimulatedEmail, getEmailHtmlTemplate } from '@/lib/emailSimulator';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { venueName, ownerName, email, phone, city, address, pincode, mapsLink, website, operatingHours, amenities, equipment } = body;

    if (!venueName || !ownerName || !email || !phone || !city || !address || !pincode || !operatingHours) {
      return NextResponse.json({ error: 'All required fields (Venue Name, Owner Name, Email, Phone, City, Address, Pincode, Operating Hours) must be filled' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    const phoneClean = phone.replace(/[^0-9+]/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return NextResponse.json({ error: 'Invalid phone number format (must be 10-15 digits)' }, { status: 400 });
    }

    const application = await Partner.create({ 
      venueName, 
      ownerName, 
      email, 
      phone, 
      city,
      address,
      pincode,
      mapsLink: mapsLink || '',
      website: website || '',
      operatingHours,
      amenities: amenities || [],
      equipment: equipment || []
    });
    const refCode = `GGO-REG-${application._id.toString().slice(-6).toUpperCase()}`;
    
    // Convert amenities and equipment to badges
    const amenitiesBadges = amenities && amenities.length > 0 
      ? amenities.map(a => `<span class="badge">${a}</span>`).join('')
      : '<span style="color: #94a3b8; font-size: 14px;">None specified</span>';
    
    const equipmentBadges = equipment && equipment.length > 0 
      ? equipment.map(e => `<span class="badge">${e}</span>`).join('')
      : '<span style="color: #94a3b8; font-size: 14px;">None specified</span>';

    // 1. Send email to Venue Owner
    const ownerSubject = `Clickongo Partner Network – Application Received (${venueName})`;
    const ownerBody = `Hi ${ownerName},\n\nThank you for submitting your application to register "${venueName}" in the Clickongo network. We have successfully received your details!\n\nHere is a summary of the information you submitted:\n- Venue Name: ${venueName}\n- Physical Address: ${address}, ${city} - ${pincode}\n- Operating Hours: ${operatingHours}\n- Phone: ${phone}\n- Website/Social: ${website || 'N/A'}\n- Amenities: ${amenities?.join(', ') || 'None'}\n- Equipment: ${equipment?.join(', ') || 'None'}\n\nWhat happens next:\n1. Virtual Verification: Our team will review your digital presence and location coordinates.\n2. Verification Check: A representative will contact you at ${phone} to schedule a quick on-site visit to inspect amenities, gym ambience, and safety standards.\n3. Account Activation: Once verified, we will generate your live profile and email your secure Partner Dashboard credentials.\n\nYour Registration Reference Code: ${refCode}\n\nBest regards,\nClickongo Onboarding Team`;

    const ownerHtml = getEmailHtmlTemplate({
      title: ownerSubject,
      contentHtml: `
        <h1>Hello ${ownerName},</h1>
        <p>Thank you for submitting your application to join the Clickongo Partner Network. We are excited about the possibility of partnering with <strong>${venueName}</strong>.</p>
        <p>Our onboarding team has received your registration details. Here is a summary of the information you submitted:</p>
        
        <table class="details-table">
          <tr>
            <td class="details-label">Venue Name</td>
            <td class="details-value"><strong>${venueName}</strong></td>
          </tr>
          <tr>
            <td class="details-label">Physical Address</td>
            <td class="details-value">${address}, ${city} - ${pincode}</td>
          </tr>
          <tr>
            <td class="details-label">Operating Hours</td>
            <td class="details-value">${operatingHours}</td>
          </tr>
          <tr>
            <td class="details-label">Website / Handle</td>
            <td class="details-value">${website ? `<a href="${website}" target="_blank" style="color: #ff3e00; text-decoration: underline;">${website}</a>` : 'Not provided'}</td>
          </tr>
          <tr>
            <td class="details-label">Amenities Claimed</td>
            <td class="details-value">${amenitiesBadges}</td>
          </tr>
          <tr>
            <td class="details-label">Equipment Claimed</td>
            <td class="details-value">${equipmentBadges}</td>
          </tr>
        </table>
        
        <div class="highlight-box">
          <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Next Steps in Onboarding</h3>
          <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155; line-height: 1.5;">
            <li style="margin-bottom: 8px;"><strong>Virtual Verification</strong>: Our team will review your digital presence and location coordinates.</li>
            <li style="margin-bottom: 8px;"><strong>Verification Check</strong>: A representative will contact you at <strong>${phone}</strong> to schedule a quick on-site visit to inspect amenities, gym ambience, and safety standards.</li>
            <li><strong>Account Activation</strong>: Once verified, we will generate your live profile and email your secure Partner Dashboard credentials.</li>
          </ol>
        </div>
        
        <p>Your unique application reference code is: <strong style="color: #ff3e00; font-family: monospace; font-size: 16px;">${refCode}</strong>. Please keep this code for future reference.</p>
        <p>If you have any questions or need to make corrections to your application, please reply directly to this email or write to us at <a href="mailto:supportclickongo@gmail.com" style="color: #ff3e00; text-decoration: none;">supportclickongo@gmail.com</a>.</p>
        <br>
        <p>Best regards,<br><strong>Clickongo Onboarding Team</strong></p>
      `
    });

    await sendSimulatedEmail({
      to: email,
      subject: ownerSubject,
      body: ownerBody,
      html: ownerHtml
    });

    // 2. Send email to Admin
    const adminSubject = `🚨 Action Required: New Partner Application - ${venueName}`;
    const adminBody = `Hello Admin,\n\nA new gym has applied to register on the Clickongo platform.\n\nGym Details:\n- Venue Name: ${venueName}\n- Owner: ${ownerName}\n- Email: ${email}\n- Phone: ${phone}\n- Location: ${address}, ${city} - ${pincode}\n- Maps Link: ${mapsLink || 'Not provided'}\n- Website: ${website || 'Not provided'}\n- Operating Hours: ${operatingHours}\n- Amenities: ${amenities?.join(', ') || 'None'}\n- Equipment: ${equipment?.join(', ') || 'None'}\n- Application ID: ${application._id}\n- Reference Code: ${refCode}\n\nRequired Action:\n1. Review the online maps and social links to run a quick virtual validation.\n2. Assign a team member to contact ${ownerName} at ${phone} and schedule a physical verification check (ambience, amenities, genuinity).\n3. Once verified, log into the Platform Admin Dashboard to complete their profile setup and approve their account.\n\nReview application here: http://localhost:3000/admin`;

    const adminHtml = getEmailHtmlTemplate({
      title: adminSubject,
      contentHtml: `
        <h1 style="color: #0f172a;">New Venue Registration Pending Review</h1>
        <p>A new partner has submitted an application to join the Clickongo network. Please coordinate virtual verification and schedule the physical check.</p>
        
        <div class="highlight-box" style="border-left-color: #ff3e00; background-color: #fff8f6;">
          <h2 style="margin: 0 0 10px 0; font-size: 15px; color: #991b1b; font-weight: 700;">Onboarding Checklist</h2>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
            <li style="margin-bottom: 6px;">Call the owner to schedule a physical check.</li>
            <li style="margin-bottom: 6px;">Verify physical layout, amenities, and equipment during the inspection.</li>
            <li>Log into the Admin Panel to approve/reject the application.</li>
          </ul>
        </div>
        
        <table class="details-table">
          <tr>
            <td class="details-label">Venue Name</td>
            <td class="details-value"><strong>${venueName}</strong></td>
          </tr>
          <tr>
            <td class="details-label">Owner Name</td>
            <td class="details-value">${ownerName}</td>
          </tr>
          <tr>
            <td class="details-label">Email Address</td>
            <td class="details-value"><a href="mailto:${email}" style="color: #ff3e00; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td class="details-label">Phone Number</td>
            <td class="details-value">${phone}</td>
          </tr>
          <tr>
            <td class="details-label">Location</td>
            <td class="details-value">${address}, ${city} - ${pincode}</td>
          </tr>
          <tr>
            <td class="details-label">Maps Link</td>
            <td class="details-value">${mapsLink ? `<a href="${mapsLink}" target="_blank" style="color: #ff3e00; text-decoration: underline;">Open Google Maps</a>` : '<span style="color: #94a3b8;">Not provided</span>'}</td>
          </tr>
          <tr>
            <td class="details-label">Website</td>
            <td class="details-value">${website ? `<a href="${website}" target="_blank" style="color: #ff3e00; text-decoration: underline;">${website}</a>` : '<span style="color: #94a3b8;">Not provided</span>'}</td>
          </tr>
          <tr>
            <td class="details-label">Operating Hours</td>
            <td class="details-value">${operatingHours}</td>
          </tr>
          <tr>
            <td class="details-label">Amenities Claimed</td>
            <td class="details-value">${amenitiesBadges}</td>
          </tr>
          <tr>
            <td class="details-label">Equipment Claimed</td>
            <td class="details-value">${equipmentBadges}</td>
          </tr>
          <tr>
            <td class="details-label">Reference Code</td>
            <td class="details-value"><code style="font-size: 14px; color: #ff3e00; font-weight: bold;">${refCode}</code></td>
          </tr>
        </table>
        
        <div class="btn-container">
          <a href="http://localhost:3000/admin" class="btn-action">Go to Admin Dashboard</a>
        </div>
      `
    });

    await sendSimulatedEmail({
      to: process.env.SMTP_USER || 'admin@clickongo.com',
      subject: adminSubject,
      body: adminBody,
      html: adminHtml
    });

    return NextResponse.json({ ...application.toObject(), refCode }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

