//! routes/dashboard.js

import { Router } from 'express';
import {
	renderAvatarModal,
	renderDashboard,
	updateAvatar,
	updateUsername,
} from '../controllers/dashboard.js';

const router = Router();

router.get('/', renderDashboard);
router.get('/avatar-modal', renderAvatarModal);
router.post('/avatar', updateAvatar);
router.post('/username', updateUsername);

export default router;
