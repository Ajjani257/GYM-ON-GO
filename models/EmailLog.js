import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema({
  to: { type: String, required: true },
  from: { type: String, default: 'system@clickongo.com' },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  html: { type: String },
}, { timestamps: true });

export default mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
