//! routes/lang.js

import { Router } from 'express';
import { changeLanguage } from '../controllers/lang.js';

const router = Router();

/**
 * Language Routes
 *
 * Handles routes related to language selection.
 */

/**
 * GET /language/:lang
 * Update the active language cookie and redirect back.
 */
router.get('/language/:lang', changeLanguage);

export default router;
