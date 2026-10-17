import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';

export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      paymentMethod = 'cod',
      paymentDetails,
      couponCode,
      shippingCity = 'Dhaka'
    } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ message: 'Please provide full customer contact and delivery details' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Server-side inventory & price verification
    let verifiedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.title || item.productId}` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.title}. Only ${product.stockQuantity} remaining.`
        });
      }

      // Calculate variant price adjustment
      let itemPrice = product.price;
      if (item.selectedVariants && typeof item.selectedVariants === 'object') {
        Object.entries(item.selectedVariants).forEach(([varName, optLabel]) => {
          const variant = product.variants.find(v => v.name.toLowerCase() === varName.toLowerCase());
          if (variant) {
            const opt = variant.options.find(o => o.label === optLabel);
            if (opt && opt.priceAdjustment) {
              itemPrice += opt.priceAdjustment;
            }
          }
        });
      }

      verifiedSubtotal += itemPrice * item.quantity;

      verifiedItems.push({
        product: product._id,
        title: product.title,
        image: product.images[0] || '/assets/products/bamboo-lattice-table-lamp.jpeg',
        price: itemPrice,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants || {}
      });

      // Deduct stock
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      if (product.stockQuantity === 0) product.inStock = false;
      await product.save();
    }

    // Shipping calculation: Inside Dhaka ৳80, Outside Dhaka ৳150, Free for orders above ৳5,000
    const isDhaka = customer.city.toLowerCase().includes('dhaka') || customer.district.toLowerCase().includes('dhaka');
    let shippingFee = isDhaka ? 80 : 150;
    if (verifiedSubtotal >= 5000) {
      shippingFee = 0;
    }

    // Coupon discount calculation
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true
      });

      if (coupon) {
        if (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) {
          if (verifiedSubtotal >= (coupon.minOrderAmount || 0)) {
            if (coupon.discountType === 'percentage') {
              discountAmount = Math.round((verifiedSubtotal * coupon.discountValue) / 100);
              if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
              }
            } else {
              discountAmount = coupon.discountValue;
            }
            appliedCoupon = coupon.code;
          }
        }
      }
    }

    const totalAmount = Math.max(0, verifiedSubtotal + shippingFee - discountAmount);

    // Unique readable order ID
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `CNZ-${randomPart}`;

    const newOrder = await Order.create({
      orderNumber,
      user: req.user ? req.user._id : null,
      customer: {
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        district: customer.district || customer.city,
        deliveryNotes: customer.deliveryNotes || ''
      },
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      shippingFee,
      discountAmount,
      couponCode: appliedCoupon,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : (paymentDetails?.transactionId ? 'verified' : 'pending'),
      paymentDetails: paymentDetails || {},
      orderStatus: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: `Order placed via ${paymentMethod.toUpperCase()}`
        }
      ],
      estimatedDelivery: isDhaka ? '1 to 2 business days' : '3 to 5 business days'
    });

    return res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const { orderNumber, phone } = req.query;
    if (!orderNumber) {
      return res.status(400).json({ message: 'Order number is required' });
    }

    const query = { orderNumber: orderNumber.toUpperCase().trim() };
    if (phone) {
      query['customer.phone'] = { $regex: new RegExp(phone.trim().slice(-10) + '$') };
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ message: 'No matching order found. Please check your Order ID and phone number.' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const query = {};
    if (status && status !== 'All') query.orderStatus = status;
    if (paymentStatus && paymentStatus !== 'All') query.paymentStatus = paymentStatus;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status) {
      order.orderStatus = status;
      order.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status updated to ${status}`
      });
    }

    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });

    const totalRevenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueAgg.length ? totalRevenueAgg[0].total : 0;

    return res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
