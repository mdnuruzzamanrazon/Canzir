import express from 'express';
import {
  createOrder,
  createManualOrder,
  trackOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  addInternalNote,
  updatePaymentDetails,
  resendClaimEmail,
  deleteOrder,
  getCustomers,
  getAllPayments,
  getOrderStats,
  getSalesAnalytics
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public / Customer
router.post('/', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => createOrder(req, res));
  }
  return createOrder(req, res);
});

router.get('/track', trackOrder);
router.get('/my', protect, getMyOrders);

// Admin Operations
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/stats', protect, adminOnly, getOrderStats);
router.get('/admin/analytics', protect, adminOnly, getSalesAnalytics);
router.get('/admin/customers', protect, adminOnly, getCustomers);
router.get('/admin/payments', protect, adminOnly, getAllPayments);
router.post('/admin/manual', protect, adminOnly, createManualOrder);

router.get('/admin/:id', protect, adminOnly, getOrderById);
router.put('/admin/:id', protect, adminOnly, updateOrderStatus);
router.post('/admin/:id/note', protect, adminOnly, addInternalNote);
router.put('/admin/:id/payment', protect, adminOnly, updatePaymentDetails);
router.post('/admin/:id/claim/resend', protect, adminOnly, resendClaimEmail);
router.delete('/admin/:id', protect, adminOnly, deleteOrder);

export default router;
