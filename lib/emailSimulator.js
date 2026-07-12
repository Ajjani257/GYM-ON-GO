import dbConnect from './mongodb';
import EmailLog from '@/models/EmailLog';
import nodemailer from 'nodemailer';

export function getEmailHtmlTemplate({ title, contentHtml }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .email-header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 32px;
      text-align: center;
      border-bottom: 3px solid #ff3e00;
    }
    .brand-logo {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.025em;
    }
    .brand-accent {
      color: #ff3e00;
    }
    .email-body {
      padding: 32px;
      color: #334155;
      line-height: 1.6;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 15px;
    }
    .highlight-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #ff3e00;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn-action {
      background-color: #ff3e00;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      display: inline-block;
      box-shadow: 0 4px 6px -1px rgba(255, 62, 0, 0.2);
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .details-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      vertical-align: top;
    }
    .details-label {
      font-weight: 600;
      color: #64748b;
      width: 35%;
    }
    .details-value {
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      background-color: #f1f5f9;
      color: #475569;
      font-size: 12px;
      font-weight: 500;
      padding: 3px 8px;
      border-radius: 4px;
      margin-right: 4px;
      margin-bottom: 4px;
      border: 1px solid #e2e8f0;
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    .footer-links a {
      color: #ff3e00;
      text-decoration: none;
      margin: 0 8px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <a href="http://localhost:3000" class="brand-logo" style="color: #ffffff; text-decoration: none;">GYM<span class="brand-accent">ON</span>GO</a>
    </div>
    <div class="email-body">
      ${contentHtml}
    </div>
    <div class="email-footer">
      <p style="margin-bottom: 8px; font-size: 12px;">This is an automated operational email from Clickongo.</p>
      <div class="footer-links">
        <a href="mailto:supportclickongo@gmail.com">Contact Support</a> | 
        <a href="http://localhost:3000/partners">Partner Portal</a>
      </div>
      <p style="margin-top: 16px; margin-bottom: 0; font-size: 11px; color: #94a3b8;">&copy; 2026 Clickongo Technologies. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendSimulatedEmail({ to, subject, body, html }) {
  try {
    await dbConnect();
    
    // Log in DB for dashboard outbox audit
    await EmailLog.create({
      to,
      from: process.env.SMTP_FROM || 'system@clickongo.com',
      subject,
      body,
      html: html || '',
    });

    const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

    if (isSmtpConfigured) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: (process.env.SMTP_PORT || '587') === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Clickongo Onboarding" <system@clickongo.com>',
        to,
        subject,
        text: body,
        html: html || undefined,
      });
      console.log(`\n📧 [SMTP] Actual email dispatched successfully to: ${to}\n`);
    } else {
      // Clean server terminal printout fallback
      console.log(`\n==================================================`);
      console.log(`✉️  [SMTP SIMULATOR] OUTGOING EMAIL RECORDED (SMTP not configured)`);
      console.log(`--------------------------------------------------`);
      console.log(`TO:      ${to}`);
      console.log(`FROM:    system@clickongo.com`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`--------------------------------------------------`);
      console.log(body);
      console.log(`==================================================\n`);
    }

    return true;
  } catch (error) {
    console.error('Email Delivery Error:', error);
    return false;
  }
}
