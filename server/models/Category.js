import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  featured: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Category = mongoose.model('Category', categorySchema);
