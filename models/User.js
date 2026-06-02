import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  totalWorkouts: { type: Number, default: 0 },
  dayStreak: { type: Number, default: 0 },
  thisMonth: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  favoriteGyms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Gym' }],
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
