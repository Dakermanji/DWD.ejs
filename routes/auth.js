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
	validateCompleteLocalSignup,
	validateSignIn,
	validateRecoveryEmail,
	validateRecoveryIntent,
	validateResetPasswordQuery,
	validateResetPassword,
} from '../middlewares/validators/auth.js';
import { signupLocal } from '../controllers/auth/signupLocal.js';
import { verifyEmail } from '../controllers/auth/verifyEmail.js';
import { completeLocalSignup } from '../controllers/auth/completeLocalSignup.js';
import { signinLocal } from '../controllers/auth/signinLocal.js';
import signout from '../controllers/auth/signout.js';
import recovery from '../controllers/auth/recovery.js';
import {
	getResetPassword,
	postResetPassword,
} from '../controllers/auth/resetPassword.js';
import { googleCall, googleCallback } from '../controllers/auth/google.js';
import { githubCall, githubCallback } from '../controllers/auth/github.js';

const router = Router();

// Sign up - Step 1: start local signup (email only)
router.post('/signup', validateSignupEmail, signupLocal);

// Sign up - Step 2: verify email via token (?token=...)
router.get('/verify-email', validateVerifyEmailQuery, verifyEmail);

// Sign up - Step 3: complete local signup
router.post(
	'/complete-local-signup',
	validateCompleteLocalSignup,
	completeLocalSignup,
);

// Sign in
router.post('/signin', validateSignIn, signinLocal);

// Sign out
router.post('/signout', signout);

// Recovery
router.post(
	'/recovery',
	validateRecoveryEmail,
	validateRecoveryIntent,
	recovery,
);

// Reset Password
router.get('/reset-password', validateResetPasswordQuery, getResetPassword);
router.post('/reset-password', validateResetPassword, postResetPassword);

// Google OAuth
router.get('/google', googleCall);
router.get('/google/callback', googleCallback);

// GitHub OAuth
router.get('/github', githubCall);
router.get('/github/callback', githubCallback);

export default router;
