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

import {
	isSafeEmail,
	isValidEmail,
	isValidUsername,
	isValidPassword,
	normalizeUsername,
	normalizeEmail,
	fail,
} from './common.js';
import { isValidToken, normalizeToken } from './token.js';

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
 * Validate the email-verification token from the query string.
 *
 * Intended route:
 * - GET /auth/verify-email
 *
 * Responsibilities:
 * - ensure the token exists in the query string
 * - ensure the token matches the expected public format
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
export function validateVerifyEmailQuery(req, res, next) {
	const { token } = req.query;

	if (!isValidToken(token)) {
		req.flash('error', 'auth:signup.verify_email_invalid_link');
		return res.redirect('/');
	}

	req.query.token = normalizeToken(token);
	next();
}

/**
 * Validate complete-local-signup input.
 *
 * Intended route:
 * - POST /auth/complete-local-signup
 *
 * Responsibilities:
 * - validate token format
 * - validate username format
 * - validate password strength
 * - validate password confirmation
 * - normalize safe fields before the controller runs
 *
 * Notes:
 * - this middleware validates request shape only
 * - username availability must be checked later in the controller/service
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
export function validateCompleteLocalSignup(req, res, next) {
	const { token, username, password, confirmPassword } = req.body;
	const errors = [];

	if (!isValidToken(token)) {
		errors.push('auth:signup.verify_email_invalid_link');
	}

	if (!isValidUsername(username)) {
		errors.push('auth:error.username_invalid');
	}

	if (!isValidPassword(password)) {
		errors.push('auth:error.password_weak');
	}

	if (password !== confirmPassword) {
		errors.push('auth:error.password_mismatch');
	}

	req.body.token = normalizeToken(token);
	req.body.username = normalizeUsername(username);
	req.validationErrors = errors;

	next();
}
