import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
mongoose.connect(process.env.MONGODB_URI);

const PartnerSchema = new mongoose.Schema({
  gymName: String,
  email: String,
  status: String,
  rejectionReason: String
}, { collection: 'partners', strict: false });
const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);

const EmailLogSchema = new mongoose.Schema({
  to: String,
  subject: String,
  body: String
}, { collection: 'emaillogs', strict: false });
const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);

async function recover() {
  const rejectedPartners = await Partner.find({ status: 'rejected' });
  for (const partner of rejectedPartners) {
    if (partner.rejectionReason === 'Did not meet quality standards. (Recovered)') {
      // Try to find the rejection email sent to this partner
      const emailLog = await EmailLog.findOne({ 
        to: partner.email,
        subject: /Gym-on-Go Partner Application Status Update/i
      }).sort({ createdAt: -1 });

      if (emailLog && emailLog.body) {
        const bodyText = emailLog.body;
        const reasonStartToken = 'Reason for Rejection:\n';
        const idx = bodyText.indexOf(reasonStartToken);
        if (idx !== -1) {
          const startIdx = idx + reasonStartToken.length;
          const endIdx = bodyText.indexOf('\n\nThank you for your interest', startIdx);
          if (endIdx !== -1) {
            const originalReason = bodyText.substring(startIdx, endIdx).trim();
            console.log(`Recovered reason for ${partner.email}:`, originalReason);
            partner.rejectionReason = originalReason;
            await partner.save();
          }
        }
      }
    }
  }
  console.log('Recovery complete!');
  process.exit(0);
}

recover();
