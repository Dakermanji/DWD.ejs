//! routes/dashboard.js

import { Router } from 'express';
import {
	renderCountryEditor,
	renderAvatarModal,
	renderDashboard,
	updateAvatar,
	updateCountry,
	updateUsername,
} from '../controllers/dashboard.js';

const router = Router();

router.get('/', renderDashboard);
router.get('/avatar-modal', renderAvatarModal);
router.get('/country-editor', renderCountryEditor);
router.post('/avatar', updateAvatar);
router.post('/country', updateCountry);
router.post('/username', updateUsername);

export default router;
