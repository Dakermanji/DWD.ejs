//! config/routes.js

/**
 * Application Routes
 *
 * Central route registry for the application.
 * Each feature owns its own route module, then gets mounted here.
 */

import { Router } from 'express';
import homeRoutes from '../routes/home.js';
import langRoutes from '../routes/lang.js';

const router = Router();

// Homepage routes
router.use('/', homeRoutes);

// Language switcher routes
router.use('/', langRoutes);

export default router;
