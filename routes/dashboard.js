//! routes/dashboard.js

import { Router } from 'express';
import { renderDashboard, updateAvatar } from '../controllers/dashboard.js';

const router = Router();

router.get('/', renderDashboard);
router.post('/avatar', updateAvatar);

export default router;
