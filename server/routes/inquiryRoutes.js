import express from 'express';
import {
  createInquiry,
  getInquiries,
  updateInquiryStatus
} from '../controllers/inquiryController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createInquiry);
router.get('/admin', protect, adminOnly, getInquiries);
router.put('/admin/:id', protect, adminOnly, updateInquiryStatus);

export default router;
