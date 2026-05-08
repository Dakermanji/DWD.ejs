//! routes/profile.js

import { Router } from 'express';
import {
	renderCountryEditor,
	renderAvatarModal,
	renderPasswordModal,
	renderProfile,
	requestAccountDeletion,
	updateAvatar,
	updateCountry,
	updatePassword,
	updateUsername,
} from '../controllers/profile.js';

const router = Router();

router.get('/', renderProfile);
router.get('/avatar-modal', renderAvatarModal);
router.get('/country-editor', renderCountryEditor);
router.get('/password-modal', renderPasswordModal);
router.post('/delete-account', requestAccountDeletion);
router.post('/avatar', updateAvatar);
router.post('/country', updateCountry);
router.post('/password', updatePassword);
router.post('/username', updateUsername);

export default router;
