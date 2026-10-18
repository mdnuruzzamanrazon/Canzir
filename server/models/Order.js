import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedVariants: { type: Map, of: String, default: {} }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  author: { type: String, default: 'System' }
});

const internalNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  author: { type: String, default: 'Staff' },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  customer: {
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, default: '' },
    deliveryNotes: { type: String, default: '' }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: null },
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bkash', 'nagad', 'rocket', 'bank', 'card'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'verified', 'paid', 'unpaid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    channelName: { type: String, default: 'Cash On Delivery' },
    provider: { type: String, default: 'Cash on Delivery' },
    transactionId: { type: String, default: '' },
    senderPhone: { type: String, default: '' },
    expectedAmount: { type: Number, default: 0 },
    receivedAmount: { type: Number, default: 0 },
    outstandingAmount: { type: Number, default: 0 },
    courierCollected: { type: Boolean, default: false },
    courierRemittanceDate: { type: Date, default: null },
    courierName: { type: String, default: '' },
    reference: { type: String, default: '' }
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  source: {
    type: String,
    enum: ['guest', 'web', 'manual'],
    default: 'web'
  },
  claim: {
    claimToken: { type: String, default: '' },
    claimExpiresAt: { type: Date, default: null },
    claimStatus: {
      type: String,
      enum: ['unclaimed', 'email_sent', 'claimed'],
      default: 'email_sent'
    }
  },
  internalNotes: [internalNoteSchema],
  statusHistory: [statusHistorySchema],
  trackingNumber: { type: String, default: '' },
  courierName: { type: String, default: '' },
  estimatedDelivery: { type: String, default: '' }
}, {
  timestamps: true
});

export const Order = mongoose.model('Order', orderSchema);

