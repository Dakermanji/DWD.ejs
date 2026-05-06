//! routes/dashboard.js

import { Router } from 'express';
import {
	renderDashboard,
	updateAvatar,
	updateUsername,
} from '../controllers/dashboard.js';

const router = Router();

router.get('/', renderDashboard);
router.post('/avatar', updateAvatar);
router.post('/username', updateUsername);

export default router;
