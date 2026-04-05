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
	isSafeString,
} from './common.js';
import { isValidToken, normalizeToken } from './token.js';
import { validateNoProfanity } from '../profanity/index.js';
import { fail } from '../../services/http/response.js';

/**
 * Namespace for auth validation flash keys.
 */
const ERROR_PREFIX = 'auth:error.';

/**
 * Practical upper bounds for sign-in input.
 *
 * Notes:
 * - identifier uses the email max because email is the longest allowed variant
 * - password is not strength-validated here, only shape-validated
 * - the password max is intentionally generous to avoid rejecting valid stored passwords
 */
const MAX_IDENTIFIER_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 1024;

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
		return fail(req, res, `${ERROR_PREFIX}email_invalid`, {
			modal: 'signup',
		});
	}

	// Normalize once, then validate the normalized value.
	const email = normalizeEmail(emailRaw);

	if (!isValidEmail(email) || !isSafeEmail(email)) {
		return fail(req, res, `${ERROR_PREFIX}email_invalid`, {
			modal: 'signup',
		});
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
		req.flash('error', 'auth:error.verify_email_invalid_link');
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
 * - validate username profanity
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

	const normalizedToken = normalizeToken(token);
	const normalizedUsername = normalizeUsername(username);

	if (!isValidToken(token)) {
		errors.push('auth:error.verify_email_invalid_link');
	}

	if (!isValidUsername(normalizedUsername)) {
		errors.push('auth:error.username_invalid');
	}

	if (!validateNoProfanity(normalizedUsername)) {
		errors.push('auth:error.username_profanity');
	}

	if (!isValidPassword(password)) {
		errors.push('auth:error.password_weak');
	}

	if (password !== confirmPassword) {
		errors.push('auth:error.password_mismatch');
	}

	req.body.token = normalizedToken;
	req.body.username = normalizedUsername;
	req.validationErrors = errors;
	next();
}

/**
 * Validate local sign-in input.
 *
 * Intended route:
 * - POST /auth/signin
 *
 * Current rules:
 * - identifier must be present
 * - identifier must be a string
 * - identifier must not be empty after trimming
 * - identifier must be either a valid email or a valid username
 * - email identifiers are normalized to lowercase
 * - username identifiers are trimmed only
 * - password must be present
 * - password must be a string
 * - password must not be empty
 * - password must stay within a practical max length
 *
 * On success:
 * - stores normalized identifier back in req.body.identifier
 * - stores identifier type in req.body.identifierType
 *
 * Notes:
 * - this middleware validates request shape only
 * - account existence, admin blocks, lockouts, and rate limits belong later
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
export function validateSignIn(req, res, next) {
	const identifierRaw = req.body?.identifier;
	const passwordRaw = req.body?.password;
	const KEY = `${ERROR_PREFIX}invalid_credentials`;

	if (!isSafeString(identifierRaw, MAX_IDENTIFIER_LENGTH)) {
		return fail(req, res, KEY, { modal: 'signin' });
	}

	if (!isSafeString(passwordRaw, MAX_PASSWORD_LENGTH)) {
		return fail(req, res, KEY, { modal: 'signin' });
	}

	const email = normalizeEmail(identifierRaw);

	if (isValidEmail(email) && isSafeEmail(email)) {
		req.body.identifier = email;
		req.body.identifierType = 'email';
		req.body.password = passwordRaw;
		return next();
	}

	const username = normalizeUsername(identifierRaw);

	if (isValidUsername(username)) {
		req.body.identifier = username;
		req.body.identifierType = 'username';
		req.body.password = passwordRaw;
		return next();
	}

	return fail(req, res, KEY, { modal: 'signin' });
}
