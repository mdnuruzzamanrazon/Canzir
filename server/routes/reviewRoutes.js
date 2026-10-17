import express from 'express';
import {
  addReview,
  getProductReviews,
  getAllReviews,
  updateReviewStatus
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => addReview(req, res));
  }
  return addReview(req, res);
});
router.get('/product/:productId', getProductReviews);
router.get('/admin', protect, adminOnly, getAllReviews);
router.put('/admin/:id', protect, adminOnly, updateReviewStatus);

export default router;
