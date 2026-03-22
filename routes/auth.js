//! routes/auth.js

/**
 * Authentication Routes
 *
 * Responsibilities:
 * - Register authentication-related routes
 * - Delegate request handling to auth controllers
 *
 * Why this file exists:
 * - Keeps auth routes isolated from other app routes
 * - Makes the authentication flow easier to grow step-by-step
 *
 * Notes:
 * - Local signup starts with email-only submission
 * - Controller logic is intentionally scaffolded for now
 */

import { Router } from 'express';
import { signupLocal } from '../controllers/auth/signupLocal.js';

const router = Router();

/**
 * Local signup entry point
 *
 * Current plan:
 * - Accept the initial signup request
 * - Start with email-only submission
 * - Later generate a completion token and send email
 */
router.post('/signup', signupLocal);

export default router;
