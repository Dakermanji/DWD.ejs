//! routes/auth.js

/**
 * Authentication Routes
 *
 * Responsibilities:
 * - Define authentication-related endpoints
 * - Attach validation middleware and controllers
 *
 * Why this file exists:
 * - Keeps auth routing isolated from the rest of the app
 * - Makes the authentication flow easier to extend step-by-step
 *
 * Notes:
 * - Local signup starts with an email-only submission
 * - Email verification is handled via a token in the query string
 */

import { Router } from 'express';
import {
	validateSignupEmail,
	validateVerifyEmailQuery,
} from '../middlewares/validators/auth.js';
import { signupLocal } from '../controllers/auth/signupLocal.js';
import { verifyEmail } from '../controllers/auth/verifyEmail.js';

const router = Router();

// Sign up - Step 1: start local signup (email only)
router.post('/signup', validateSignupEmail, signupLocal);

// Sign up - Step 2: verify email via token (?token=...)
router.get('/verify-email', validateVerifyEmailQuery, verifyEmail);

export default router;
