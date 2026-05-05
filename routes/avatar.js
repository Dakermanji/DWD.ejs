//! routes/avatar.js

import { Router } from 'express';
import { refreshAvatarStyle } from '../controllers/avatar.js';

const router = Router();

router.get('/options/:style', refreshAvatarStyle);

export default router;
