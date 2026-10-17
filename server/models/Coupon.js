import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: null },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Coupon = mongoose.model('Coupon', couponSchema);
