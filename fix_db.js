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
}, { collection: 'partners', strict: false });

const Partner = mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);

async function fix() {
  await Partner.updateMany(
    { status: 'rejected', rejectionReason: { $exists: false } },
    { $set: { rejectionReason: 'Did not meet quality standards. (Recovered)' } }
  );
  console.log('Fixed missing rejection reasons');
  process.exit(0);
}

fix();
