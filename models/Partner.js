import mongoose from 'mongoose';

const PartnerSchema = new mongoose.Schema({
  venueName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  mapsLink: { type: String, default: '' },
  website: { type: String, default: '' },
  operatingHours: { type: String, required: true },
  amenities: [{ type: String }],
  equipment: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);
