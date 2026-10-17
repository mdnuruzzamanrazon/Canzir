import express from 'express';
import {
  createCustomInquiry,
  getCustomInquiries,
  updateCustomInquiry
} from '../controllers/customDesignController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', createCustomInquiry);
router.get('/admin', protect, adminOnly, getCustomInquiries);
router.put('/admin/:id', protect, adminOnly, updateCustomInquiry);

export default router;
