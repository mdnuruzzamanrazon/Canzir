import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  toggleWishlist,
  getAllUsers
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/wishlist/toggle', protect, toggleWishlist);
router.get('/users', protect, adminOnly, getAllUsers);

export default router;
