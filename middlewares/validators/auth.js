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
	normalizeText,
	normalizeEmail,
	isSafeString,
	isValidLang,
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
 * Validate and normalize an email field.
 * Reusable across multiple auth flows (signup, recovery, etc.).
 */
export function validateEmailField(req, res, next, { modal }) {
	const emailRaw = req.body?.email;

	// Ensure a non-empty string before normalization.
	if (typeof emailRaw !== 'string' || !emailRaw.trim()) {
		return fail(req, res, `${ERROR_PREFIX}email_invalid`, { modal });
	}

	const email = normalizeEmail(emailRaw);

	// Validate normalized email for format and safety.
	if (!isValidEmail(email) || !isSafeEmail(email)) {
		return fail(req, res, `${ERROR_PREFIX}email_invalid`, { modal });
	}

	req.body.email = email;
	next();
}

/**
 * Validate and normalize token + optional language from query params.
 *
 * Behavior:
 * - ensures token is valid
 * - normalizes token and lang
 * - validates lang only if provided
 * - attaches normalized values back to req.query
 *
 * @param {string} errorKey - i18n key for invalid link error
 * @returns {import('express').RequestHandler}
 */
export const validateTokenAndLangQuery = (errorKey) => {
	return function (req, res, next) {
		const { token, lang } = req.query;

		const normalizedToken = normalizeToken(token);
		const normalizedLang = normalizeText(lang, { lower: true });

		if (!isValidToken(token) || (lang && !isValidLang(normalizedLang))) {
			req.flash('error', errorKey);
			return res.redirect('/');
		}

		req.query.token = normalizedToken;
		req.query.lang = normalizedLang;

		next();
	};
};

/**
 * Validate query params for email verification link.
 *
 * Uses shared token+lang validator with verify-email error message.
 */
export const validateVerifyEmailQuery = validateTokenAndLangQuery(
	'auth:error.verify_email_invalid_link',
);

/**
 * Validate query params for reset-password link.
 *
 * Uses shared token+lang validator with reset-password error message.
 */
export const validateResetPasswordQuery = validateTokenAndLangQuery(
	'auth:error.reset_password_invalid_link',
);

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
	const normalizedUsername = normalizeText(username);

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

	const username = normalizeText(identifierRaw);

	if (isValidUsername(username)) {
		req.body.identifier = username;
		req.body.identifierType = 'username';
		req.body.password = passwordRaw;
		return next();
	}

	return fail(req, res, KEY, { modal: 'signin' });
}

/**
 * Signup email validation.
 */
export function validateSignupEmail(req, res, next) {
	return validateEmailField(req, res, next, { modal: 'signup' });
}

/**
 * Recovery email validation.
 */
export function validateRecoveryEmail(req, res, next) {
	return validateEmailField(req, res, next, { modal: 'recovery' });
}

/**
 * Ensure recovery intent is valid.
 */
export function validateRecoveryIntent(req, res, next) {
	const intent = req.body?.intent;

	if (intent !== 'password_reset' && intent !== 'resend_verification') {
		return fail(req, res, `common:error.invalid_request`, {
			modal: 'recovery',
		});
	}

	next();
}

/**
 * Validate reset-password input.
 *
 * Intended route:
 * - POST /auth/reset-password
 *
 * Responsibilities:
 * - validate token format
 * - validate password strength
 * - validate password confirmation
 * - normalize safe fields before the controller runs
 *
 * Notes:
 * - this middleware validates request shape only
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
export function validateResetPassword(req, res, next) {
	const modal = 'reset_password';
	const { token, password, confirmPassword } = req.body;
	const normalizedToken = normalizeToken(token);

	if (!isValidToken(normalizedToken)) {
		return fail(req, res, `${ERROR_PREFIX}reset_password_invalid_link`, {
			modal,
		});
	}

	if (!password || !isValidPassword(password)) {
		return fail(req, res, `${ERROR_PREFIX}password_weak`, {
			modal,
		});
	}

	if (password !== confirmPassword) {
		return fail(req, res, `${ERROR_PREFIX}password_mismatch`, {
			modal,
		});
	}

	req.body.token = normalizedToken;
	next();
}
