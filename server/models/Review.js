import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userName: { type: String, required: true, trim: true },
  userEmail: { type: String, trim: true, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: true },
  status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' }
}, {
  timestamps: true
});

export const Review = mongoose.model('Review', reviewSchema);
