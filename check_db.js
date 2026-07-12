import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

mongoose.connect(process.env.MONGODB_URI);

const PartnerSchema = new mongoose.Schema({
  venueName: String,
  email: String,
  status: String,
  rejectionReason: String
}, { collection: 'partners' });

const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);

async function check() {
  const partners = await Partner.find({ status: 'rejected' });
  console.log('Rejected partners:', partners);
  process.exit(0);
}

check();
