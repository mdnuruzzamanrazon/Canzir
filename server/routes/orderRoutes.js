import express from 'express';
import {
  createOrder,
  trackOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', (req, res, next) => {
  // Optional auth: if token present, attach user
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => createOrder(req, res));
  }
  return createOrder(req, res);
});

router.get('/track', trackOrder);
router.get('/my', protect, getMyOrders);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/stats', protect, adminOnly, getOrderStats);
router.put('/admin/:id', protect, adminOnly, updateOrderStatus);

export default router;
