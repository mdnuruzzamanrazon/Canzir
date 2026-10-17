import { Coupon } from '../models/Coupon.js';

export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (cartTotal && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `This coupon requires a minimum cart total of ৳${coupon.minOrderAmount}`
      });
    }

    let discount = 0;
    if (cartTotal) {
      if (coupon.discountType === 'percentage') {
        discount = Math.round((cartTotal * coupon.discountValue) / 100);
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      } else {
        discount = coupon.discountValue;
      }
    }

    return res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountCalculated: discount
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, coupons });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiresAt } = req.body;
    const exists = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (exists) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      expiresAt: expiresAt || null
    });

    return res.status(201).json({ success: true, coupon });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
