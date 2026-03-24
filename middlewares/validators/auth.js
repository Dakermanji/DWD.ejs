//! middlewares/validators/auth.js

/**
 * Auth validators
 * ---------------
 * Route-level validation middleware for auth flows.
 *
 * Why this file exists:
 * - keeps auth controllers focused on business logic
 * - validates and normalizes input early
 * - keeps auth validation rules consistent
 */

import { isSafeEmail, isValidEmail, normalizeEmail, fail } from './common.js';

/**
 * Namespace for auth validation flash keys.
 */
const ERROR_PREFIX = 'auth:error.';

/**
 * Validate the email-first signup step.
 *
 * Intended route:
 * - POST /auth/signup
 *
 * Current rules:
 * - email must be present
 * - email must be a string
 * - email must not be empty after trimming
 * - email is normalized before use
 * - email must pass format validation
 * - email must pass basic sanity checks
 *
 * On success:
 * - stores normalized email back in req.body.email
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
export function validateSignupEmail(req, res, next) {
	const emailRaw = req.body?.email;

	// Reject invalid shapes early.
	if (typeof emailRaw !== 'string' || !emailRaw.trim()) {
		return fail(req, res, `${ERROR_PREFIX}email_invalid`, 'signup');
	}

	// Normalize once, then validate the normalized value.
	const email = normalizeEmail(emailRaw);

	if (!isValidEmail(email) || !isSafeEmail(email)) {
		return fail(req, res, `${ERROR_PREFIX}email_invalid`, 'signup');
	}

	req.body.email = email;

	next();
}

/**
 * Validate verify-email query parameters.
 *
 * Intended route:
 * - GET /auth/verify-email
 *
 * Responsibilities:
 * - Ensure the verification token exists
 * - Ensure the token has a valid basic format
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validateVerifyEmailQuery(req, res, next) {
	const { token } = req.query;

	// Token must exist and be a string
	if (!token || typeof token !== 'string') {
		req.flash('error', 'auth:signup.verify_email_invalid_link');
		return res.redirect('/');
	}

	// Ensure expected token length (prevents malformed input)
	if (token.length !== 64) {
		req.flash('error', 'auth:signup.verify_email_invalid_link');
		return res.redirect('/');
	}

	next();
}
