//! routes/theme.js

import { Router } from 'express';
import { updateTheme } from '../controllers/theme.js';

const router = Router();

router.post('/', updateTheme);

export default router;
