//! routes/home.js

import { Router } from 'express';
import { renderHome } from '../controllers/home.js';

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

export default router;
