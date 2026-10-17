import express from 'express';
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/admin', protect, adminOnly, getAllCoupons);
router.post('/admin', protect, adminOnly, createCoupon);
router.delete('/admin/:id', protect, adminOnly, deleteCoupon);

export default router;
