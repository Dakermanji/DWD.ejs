//! routes/home.js

import { Router } from 'express';
import { renderHome, sendContactMessage } from '../controllers/home.js';

const router = Router();

/**
 * Home Routes
 *
 * Handles routes related to the homepage.
 */

/**
 * GET /
 * Render the homepage.
 */
router.get('/', renderHome);
router.post('/contact', sendContactMessage);

export default router;
