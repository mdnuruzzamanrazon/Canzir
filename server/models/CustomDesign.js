import mongoose from 'mongoose';

const customDesignSchema = new mongoose.Schema({
  inquiryNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, default: '', trim: true },
  productType: {
    type: String,
    required: true,
    enum: ['Table Lamp', 'Pendant Light', 'Wall Sconce', 'Floor Lamp', 'Chandelier', 'Decorative Accent', 'Other']
  },
  material: {
    type: String,
    required: true,
    enum: ['Natural River Bamboo', 'Seasoned Teak Wood', 'Smoked Dark Bamboo', 'Cane / Rattan Weave', 'Combination']
  },
  finish: {
    type: String,
    default: 'Natural Matt Linen Oil',
    enum: ['Natural Matt Linen Oil', 'Honey Warm Gloss', 'Smoked Dark Walnut', 'Raw Organic']
  },
  dimensions: { type: String, default: '' },
  budgetRange: { type: String, default: '৳2,500 - ৳5,000' },
  referenceImage: { type: String, default: '' },
  instructions: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Quoted', 'In Production', 'Completed', 'Declined'],
    default: 'Pending'
  },
  quotedPrice: { type: Number, default: 0 },
  adminNotes: { type: String, default: '' }
}, {
  timestamps: true
});

export const CustomDesign = mongoose.model('CustomDesign', customDesignSchema);
