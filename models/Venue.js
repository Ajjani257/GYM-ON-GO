import mongoose from 'mongoose';

const VenueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, default: '' },
  pricePerHour: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  category: { type: String, enum: ['gym', 'badminton', 'football', 'tennis', 'swimming', 'cricket'], default: 'gym' },
  bookingType: { type: String, enum: ['per_person', 'per_court'], default: 'per_person' },
  crowdLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
  hours: { type: String, default: '06:00 - 22:00' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  image: { type: String, default: '' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  amenities: [{ type: String }],
  equipment: [{ type: String }],
  slots: [{
    time: String,
    capacity: { type: Number, default: 20 },
    days: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] }
  }],
  priority: { type: Number, default: 0 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pricingRules: [{
    dayOfWeek: [Number],
    startTime: String,
    endTime: String,
    multiplier: { type: Number, default: 1.0 }
  }],
}, { timestamps: true });

export default mongoose.models.Venue || mongoose.model('Venue', VenueSchema);
