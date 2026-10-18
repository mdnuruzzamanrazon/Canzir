import express from 'express';
import {
  getProductQuestions,
  getAllQuestions,
  createQuestion,
  answerQuestion,
  deleteQuestion
} from '../controllers/questionController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:productId', getProductQuestions);
router.post('/', createQuestion);

// Admin
router.get('/admin', protect, adminOnly, getAllQuestions);
router.put('/admin/:id', protect, adminOnly, answerQuestion);
router.delete('/admin/:id', protect, adminOnly, deleteQuestion);

export default router;
