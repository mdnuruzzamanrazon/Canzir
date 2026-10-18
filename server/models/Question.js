import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  answeredBy: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'answered', 'published', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export const Question = mongoose.model('Question', questionSchema);
