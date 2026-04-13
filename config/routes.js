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
import authRoutes from '../routes/auth.js';
import socialRoutes from '../routes/social.js';

const router = Router();

// Homepage routes
router.use('/', homeRoutes);

// Language switcher routes
router.use('/language', langRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Social routes
router.use('/social', socialRoutes);

export default router;
