import mongoose from 'mongoose';

const PlanEnquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  planType: { type: String, enum: ['corporate', 'parent'], required: true },
  orgSize: { type: String, default: '' },   // "5-10 employees" or "2 kids" etc.
  phone: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' },
}, { timestamps: true });

export default mongoose.models.PlanEnquiry || mongoose.model('PlanEnquiry', PlanEnquirySchema);
