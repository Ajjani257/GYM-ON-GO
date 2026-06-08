import mongoose from 'mongoose';

const GymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, default: '' },
  pricePerHour: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  crowdLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
  hours: { type: String, default: '06:00 - 22:00' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  image: { type: String, default: '' },
  amenities: [{ type: String }],
  equipment: [{ type: String }],
  slots: [{
    time: String,
    capacity: { type: Number, default: 20 },
  }],
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pricingRules: [{
    dayOfWeek: [Number],
    startTime: String,
    endTime: String,
    multiplier: { type: Number, default: 1.0 }
  }],
}, { timestamps: true });

export default mongoose.models.Gym || mongoose.model('Gym', GymSchema);
