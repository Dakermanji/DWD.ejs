//! routes/profile.js

import { Router } from 'express';
import {
	renderCountryEditor,
	renderAvatarModal,
	renderProfile,
	updateAvatar,
	updateCountry,
	updateUsername,
} from '../controllers/profile.js';

const router = Router();

router.get('/', renderProfile);
router.get('/avatar-modal', renderAvatarModal);
router.get('/country-editor', renderCountryEditor);
router.post('/avatar', updateAvatar);
router.post('/country', updateCountry);
router.post('/username', updateUsername);

export default router;
