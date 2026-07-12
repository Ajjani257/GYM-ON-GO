import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalWorkouts: { type: Number, default: 0 },
  dayStreak: { type: Number, default: 0 },
  thisMonth: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  lifetimePoints: { type: Number, default: 0 },
  favoriteGyms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }],
  role: { type: String, enum: ['member', 'partner', 'admin'], default: 'member' },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralsCount: { type: Number, default: 0 },
  referralClaimed: { type: Boolean, default: false },
  activePass: {
    passType: { type: String, enum: ['none', 'weekly', 'monthly'], default: 'none' },
    expiresAt: { type: Date },
    lastBookedDate: { type: String, default: '' },
  }
}, { timestamps: true });

// Generate referral code before saving if not already set
UserSchema.pre('save', function(next) {
  if (!this.referralCode) {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.referralCode = `GYMGO-${rand}`;
  }
  if (typeof next === 'function') next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
