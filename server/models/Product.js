import mongoose from 'mongoose';

const variantOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  priceAdjustment: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true }
});

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Finish', 'Size', 'Cord Type'
  options: [variantOptionSchema]
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, default: null }, // Original price before discount
  rating: { type: Number, default: 4.9, min: 0, max: 5 },
  reviewCount: { type: Number, default: 12 },
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 25 },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  materials: [{ type: String }], // 'Natural River Bamboo', 'Seasoned Teak Wood', 'Braided Jute Cord'
  dimensions: {
    height: { type: String, default: '14"' },
    width: { type: String, default: '10"' },
    diameter: { type: String, default: '10"' },
    weight: { type: String, default: '1.2 kg' }
  },
  specifications: {
    bulbType: { type: String, default: 'E27 Warm Amber LED (Included)' },
    wattage: { type: String, default: '5W - 9W' },
    voltage: { type: String, default: '220V - 240V AC' },
    cordLength: { type: String, default: '1.8 meters woven braided cord with inline switch' },
    craftMethod: { type: String, default: 'Hand-split bamboo lattice, artisan woven' }
  },
  variants: [variantSchema],
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  roomType: [{ type: String }], // 'Living Room', 'Bedroom', 'Dining', 'Reading Nook', 'Balcony'
  lightingStyle: { type: String, default: 'Warm Ambient Glow' } // 'Warm Ambient Glow', 'Diffused Lattice', 'Architectural Accent'
}, {
  timestamps: true
});

export const Product = mongoose.model('Product', productSchema);
