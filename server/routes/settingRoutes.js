import express from 'express';
import { getSettings, updateSetting } from '../controllers/settingController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSettings);
router.post('/admin', protect, adminOnly, updateSetting);

export default router;
