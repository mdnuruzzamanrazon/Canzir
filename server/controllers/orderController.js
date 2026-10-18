import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { User } from '../models/User.js';
import crypto from 'crypto';

// 1. Create Order (Public / Customer Checkout)
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      paymentMethod = 'cod',
      paymentDetails = {},
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
    const isDhaka = customer.city?.toLowerCase().includes('dhaka') || customer.district?.toLowerCase().includes('dhaka');
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

    // Unique readable order ID (CNZ-10001 format)
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `CNZ-${randomPart}`;

    const isGuest = !req.user;
    const channelMap = {
      cod: 'Cash On Delivery',
      bkash: 'bKash Online / Manual',
      nagad: 'Nagad Online / Manual',
      rocket: 'Rocket Mobile Banking',
      bank: 'Bank Transfer (BRAC Bank)',
      card: 'Credit / Debit Card'
    };

    const isInitialPaid = paymentMethod !== 'cod' && Boolean(paymentDetails?.transactionId);
    const receivedAmount = isInitialPaid ? totalAmount : 0;
    const outstandingAmount = Math.max(0, totalAmount - receivedAmount);

    const claimToken = crypto.randomBytes(16).toString('hex');
    const claimExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

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
        postalCode: customer.postalCode || '',
        deliveryNotes: customer.deliveryNotes || ''
      },
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      shippingFee,
      discountAmount,
      couponCode: appliedCoupon,
      totalAmount,
      paymentMethod,
      paymentStatus: isInitialPaid ? 'verified' : 'pending',
      paymentDetails: {
        channelName: channelMap[paymentMethod] || 'Cash On Delivery',
        provider: channelMap[paymentMethod] || 'Cash On Delivery',
        transactionId: paymentDetails?.transactionId || '',
        senderPhone: paymentDetails?.senderPhone || '',
        expectedAmount: totalAmount,
        receivedAmount,
        outstandingAmount,
        courierCollected: false,
        reference: paymentDetails?.transactionId || ''
      },
      orderStatus: 'Pending',
      source: isGuest ? 'guest' : 'web',
      claim: {
        claimToken,
        claimExpiresAt,
        claimStatus: 'email_sent'
      },
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: `Order placed via ${channelMap[paymentMethod] || paymentMethod.toUpperCase()} (${isGuest ? 'Guest checkout' : 'Registered user'})`,
          author: isGuest ? 'System · Guest checkout' : `Customer · ${req.user.name}`
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

// 2. Create Manual Order (Admin initiated)
export const createManualOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      paymentMethod = 'cod',
      paymentStatus = 'pending',
      shippingFee = 80,
      discountAmount = 0,
      internalNote = '',
      deliveryNotes = ''
    } = req.body;

    if (!customer?.name || !customer?.phone || !customer?.address) {
      return res.status(400).json({ message: 'Customer name, phone, and address are required' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ message: 'At least one item is required' });
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const it of items) {
      const prod = await Product.findById(it.productId || it.product);
      const price = Number(it.price) || (prod ? prod.price : 0);
      const qty = Number(it.quantity) || 1;
      subtotal += price * qty;

      verifiedItems.push({
        product: prod?._id || null,
        title: it.title || prod?.title || 'Handcrafted Lighting Fixture',
        image: it.image || prod?.images?.[0] || '/assets/products/bamboo-lattice-table-lamp.jpeg',
        price,
        quantity: qty,
        selectedVariants: it.selectedVariants || {}
      });

      if (prod) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - qty);
        if (prod.stockQuantity === 0) prod.inStock = false;
        await prod.save();
      }
    }

    const totalAmount = Math.max(0, subtotal + Number(shippingFee) - Number(discountAmount));
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `CNZ-${randomPart}`;

    const channelMap = {
      cod: 'Cash On Delivery',
      bkash: 'bKash Manual Remittance',
      nagad: 'Nagad Manual Remittance',
      rocket: 'Rocket Mobile Banking',
      bank: 'Bank Transfer (BRAC Bank)',
      card: 'POS Card Terminal'
    };

    const isPaid = paymentStatus === 'paid' || paymentStatus === 'verified';
    const receivedAmount = isPaid ? totalAmount : 0;
    const outstandingAmount = Math.max(0, totalAmount - receivedAmount);

    const order = await Order.create({
      orderNumber,
      customer: {
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address,
        city: customer.city || 'Dhaka',
        district: customer.district || customer.city || 'Dhaka',
        postalCode: customer.postalCode || '',
        deliveryNotes
      },
      items: verifiedItems,
      subtotal,
      shippingFee: Number(shippingFee),
      discountAmount: Number(discountAmount),
      totalAmount,
      paymentMethod,
      paymentStatus,
      paymentDetails: {
        channelName: channelMap[paymentMethod] || 'Cash On Delivery',
        provider: channelMap[paymentMethod] || 'Cash On Delivery',
        transactionId: req.body.transactionId || '',
        expectedAmount: totalAmount,
        receivedAmount,
        outstandingAmount,
        courierCollected: false
      },
      orderStatus: 'Confirmed',
      source: 'manual',
      claim: {
        claimToken: crypto.randomBytes(16).toString('hex'),
        claimExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        claimStatus: 'email_sent'
      },
      internalNotes: internalNote
        ? [{ note: internalNote, author: req.user?.name || 'Admin', createdAt: new Date() }]
        : [],
      statusHistory: [
        {
          status: 'Confirmed',
          timestamp: new Date(),
          note: `Manual order created by staff (${req.user?.name || 'Admin'})`,
          author: req.user?.name || 'Staff'
        }
      ],
      estimatedDelivery: '1 to 3 business days'
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 3. Track Order (Public / Customer - by Order Number, Phone, or Both)
export const trackOrder = async (req, res) => {
  try {
    const { orderNumber, phone } = req.query;
    const hasOrderNumber = Boolean(orderNumber && orderNumber.trim());
    const hasPhone = Boolean(phone && phone.trim());

    if (!hasOrderNumber && !hasPhone) {
      return res.status(400).json({
        message: 'Please provide either your Order Reference ID or your Phone Number to track your order.'
      });
    }

    // Case 1: Phone number alone (Customer does not have their Order ID)
    if (!hasOrderNumber && hasPhone) {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length < 4) {
        return res.status(400).json({
          message: 'Please enter a valid phone number with at least 4 digits.'
        });
      }

      const digits = cleanPhone.slice(-10);
      const pattern = digits.split('').join('\\D*');
      const phoneRegex = new RegExp(pattern);
      const orders = await Order.find({ 'customer.phone': { $regex: phoneRegex } }).sort({ createdAt: -1 });

      if (!orders || orders.length === 0) {
        return res.status(404).json({
          message: `No orders found associated with phone number "${phone.trim()}". Please check your number or enter your Order Reference ID.`
        });
      }

      return res.json({
        success: true,
        order: orders[0],
        orders: orders
      });
    }

    // Case 2: Order Number provided (with or without optional phone verification)
    const raw = orderNumber.trim();
    const cleanNum = raw.toUpperCase();
    const stripped = cleanNum.replace(/^CNZ-/, '');

    // Flexible query matching full ID 'CNZ-12345' or raw number '12345'
    const numberFilter = {
      $or: [
        { orderNumber: cleanNum },
        { orderNumber: `CNZ-${cleanNum}` },
        { orderNumber: stripped },
        { orderNumber: { $regex: new RegExp(stripped + '$', 'i') } }
      ]
    };

    let query = { ...numberFilter };

    if (hasPhone) {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length >= 4) {
        const digits = cleanPhone.slice(-10);
        const pattern = digits.split('').join('\\D*');
        query['customer.phone'] = { $regex: new RegExp(pattern) };
      }
    }

    let order = await Order.findOne(query);

    // If not found with phone filter, check if the orderNumber exists to provide helpful feedback
    if (!order && hasPhone) {
      const orderExists = await Order.findOne(numberFilter);
      if (orderExists) {
        return res.status(400).json({
          message: 'Order ID found, but the phone number does not match the delivery contact on file. Please check your phone number or enter the phone used during checkout.'
        });
      }
    }

    if (!order) {
      return res.status(404).json({
        message: 'No matching order found for this Order ID. Please check your confirmation SMS or track using the phone number used at checkout.'
      });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 4. Get My Orders (Customer)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { 'customer.email': req.user.email }
      ]
    }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 5. Get All Orders (Admin with comprehensive filters)
export const getAllOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      source,
      claimStatus,
      search,
      page = 1,
      limit = 100
    } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    if (source && source !== 'All') {
      query.source = source.toLowerCase();
    }

    if (claimStatus && claimStatus !== 'All') {
      query['claim.claimStatus'] = claimStatus.toLowerCase();
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: regex },
        { 'customer.name': regex },
        { 'customer.phone': regex },
        { 'customer.email': regex },
        { 'items.title': regex }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.json({
      success: true,
      total,
      count: orders.length,
      orders
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 6. Get Single Order Detail (Admin)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 7. Update Order Status & Fulfillment (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const {
      status,
      note,
      trackingNumber,
      courierName,
      paymentStatus
    } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status && status !== order.orderStatus) {
      const prevStatus = order.orderStatus;
      order.orderStatus = status;
      order.statusHistory.unshift({
        status,
        timestamp: new Date(),
        note: note || `Order transitioned from ${prevStatus} to ${status}`,
        author: req.user?.name || 'Staff'
      });
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    if (courierName !== undefined) {
      order.courierName = courierName;
    }

    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' || paymentStatus === 'verified') {
        order.paymentDetails.receivedAmount = order.totalAmount;
        order.paymentDetails.outstandingAmount = 0;
      }
    }

    await order.save();
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 8. Add Internal Staff Note (Admin)
export const addInternalNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ message: 'Note text cannot be empty' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.internalNotes.unshift({
      note: note.trim(),
      author: req.user?.name || 'Staff',
      createdAt: new Date()
    });

    await order.save();
    return res.json({ success: true, internalNotes: order.internalNotes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 9. Update Payment Details & Remittance (Admin)
export const updatePaymentDetails = async (req, res) => {
  try {
    const {
      paymentStatus,
      receivedAmount,
      courierCollected,
      courierName,
      transactionId,
      reference
    } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (receivedAmount !== undefined) {
      order.paymentDetails.receivedAmount = Number(receivedAmount);
      order.paymentDetails.outstandingAmount = Math.max(0, order.totalAmount - Number(receivedAmount));
    }

    if (courierCollected !== undefined) {
      order.paymentDetails.courierCollected = Boolean(courierCollected);
      if (courierCollected) {
        order.paymentDetails.courierRemittanceDate = new Date();
        order.paymentDetails.receivedAmount = order.totalAmount;
        order.paymentDetails.outstandingAmount = 0;
        order.paymentStatus = 'paid';
      }
    }

    if (courierName) order.paymentDetails.courierName = courierName;
    if (transactionId) order.paymentDetails.transactionId = transactionId;
    if (reference) order.paymentDetails.reference = reference;

    order.statusHistory.unshift({
      status: `Payment: ${order.paymentStatus}`,
      timestamp: new Date(),
      note: `Payment updated. Received: ৳${order.paymentDetails.receivedAmount}, Outstanding: ৳${order.paymentDetails.outstandingAmount}`,
      author: req.user?.name || 'Staff'
    });

    await order.save();
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 10. Resend Claim Email (Admin)
export const resendClaimEmail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.claim.claimExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    order.claim.claimStatus = 'email_sent';

    order.statusHistory.unshift({
      status: 'Claim Notification',
      timestamp: new Date(),
      note: `Claim email resent to ${order.customer.email || order.customer.phone}`,
      author: req.user?.name || 'Staff'
    });

    await order.save();
    return res.json({ success: true, message: 'Claim email dispatched successfully', claim: order.claim });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 11. Delete Order (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json({ success: true, message: `Order ${order.orderNumber} deleted successfully` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 12. Get Aggregated Customers Directory (Admin)
export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;

    // Get all orders to calculate customer metrics
    const orders = await Order.find({}).sort({ createdAt: -1 });
    const registeredUsers = await User.find({ role: 'customer' }).sort({ createdAt: -1 });

    const customerMap = new Map();

    // Map registered users first
    registeredUsers.forEach(u => {
      const key = (u.phone || u.email || u._id.toString()).toLowerCase().trim();
      customerMap.set(key, {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        phone: u.phone || '—',
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: null,
        lastOrderNumber: null,
        status: 'Active',
        joined: u.createdAt,
        type: 'Registered Member',
        address: u.addresses?.[0]
          ? `${u.addresses[0].street}, ${u.addresses[0].city}`
          : '—'
      });
    });

    // Aggregate orders
    orders.forEach(ord => {
      const key = (ord.customer?.phone || ord.customer?.email || ord.customer?.name || '').toLowerCase().trim();
      if (!key) return;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: `guest_${ord._id.toString()}`,
          name: ord.customer.name,
          email: ord.customer.email || '—',
          phone: ord.customer.phone || '—',
          ordersCount: 0,
          totalSpent: 0,
          lastOrderDate: ord.createdAt,
          lastOrderNumber: ord.orderNumber,
          status: 'Active',
          joined: ord.createdAt,
          type: 'Guest Checkout',
          address: `${ord.customer.address}, ${ord.customer.city}`
        });
      }

      const cust = customerMap.get(key);
      cust.ordersCount += 1;
      cust.totalSpent += ord.totalAmount || 0;
      if (!cust.lastOrderDate || new Date(ord.createdAt) > new Date(cust.lastOrderDate)) {
        cust.lastOrderDate = ord.createdAt;
        cust.lastOrderNumber = ord.orderNumber;
      }
    });

    let customers = Array.from(customerMap.values());

    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      customers = customers.filter(
        c =>
          c.name.toLowerCase().includes(term) ||
          c.phone.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
      );
    }

    return res.json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 13. Get Payments Hub (Admin)
export const getAllPayments = async (req, res) => {
  try {
    const { status, provider, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.paymentStatus = status.toLowerCase();
    }

    if (provider && provider !== 'All') {
      query['paymentDetails.channelName'] = new RegExp(provider, 'i');
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: regex },
        { 'customer.name': regex },
        { 'customer.phone': regex },
        { 'paymentDetails.transactionId': regex }
      ];
    }

    const orders = await Order.find(query).sort({ updatedAt: -1 });

    const payments = orders.map(ord => ({
      _id: ord._id,
      orderId: ord._id,
      orderNumber: ord.orderNumber,
      customer: ord.customer,
      provider: ord.paymentDetails?.provider || ord.paymentMethod?.toUpperCase(),
      channel: ord.paymentDetails?.channelName || ord.paymentMethod,
      amount: ord.totalAmount,
      expected: ord.paymentDetails?.expectedAmount || ord.totalAmount,
      received: ord.paymentDetails?.receivedAmount || (ord.paymentStatus === 'paid' ? ord.totalAmount : 0),
      outstanding: ord.paymentDetails?.outstandingAmount ?? (ord.paymentStatus === 'paid' ? 0 : ord.totalAmount),
      status: ord.paymentStatus,
      transactionId: ord.paymentDetails?.transactionId || '—',
      courierCollected: Boolean(ord.paymentDetails?.courierCollected),
      lastUpdated: ord.updatedAt,
      createdAt: ord.createdAt
    }));

    return res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 14. Comprehensive Real-time Dashboard Overview Metrics (Admin)
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'Confirmed' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
    const outForDeliveryOrders = await Order.countDocuments({ orderStatus: 'Out for Delivery' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

    // Today's range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const newOrdersToday = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

    // Pending payment verification
    const pendingVerification = await Order.countDocuments({
      $or: [{ paymentStatus: 'pending' }, { orderStatus: 'Pending' }]
    });

    // Start of this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Low stock products alert (<= 5 units)
    const lowStockAlerts = await Product.countDocuments({ stockQuantity: { $lte: 5 } });

    // Revenue calculations
    const totalRevenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueAgg.length ? totalRevenueAgg[0].total : 0;

    const settledRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'verified'] }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const settledRevenue = settledRevenueAgg.length ? settledRevenueAgg[0].total : 0;

    // Recent orders
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(6);

    return res.json({
      success: true,
      stats: {
        newOrdersToday,
        pendingVerification,
        lowStockAlerts,
        ordersThisMonth,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        outForDeliveryOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        settledRevenue,
        statusDistribution: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          outForDelivery: outForDeliveryOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        recentOrders
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
