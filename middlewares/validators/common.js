//! middlewares/validators/common.js

/**
 * Shared validation helpers
 * -------------------------
 * Reusable normalization, validation, and failure helpers used by
 * auth validators and other request-validation flows.
 *
 * Why this file exists:
 * - keeps route validators focused on request-specific rules
 * - centralizes shared normalization logic
 * - centralizes common validation helpers
 * - centralizes the standard validation failure response
 *
 * Notes:
 * - helpers in this file should stay generic and reusable
 * - business rules that require database access do not belong here
 */

import validator from 'validator';

/**
 * Allowed username format.
 *
 * Rules:
 * - 3 to 20 characters
 * - letters, numbers, underscore, dash, dot
 *
 * Notes:
 * - this validates format only
 * - availability/uniqueness must be checked elsewhere
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,20}$/;

/**
 * Allowed password format.
 *
 * Rules:
 * - minimum 8 characters
 * - at least 1 lowercase letter
 * - at least 1 uppercase letter
 * - at least 1 number
 * - at least 1 symbol
 *
 * Notes:
 * - this is a strength baseline only
 * - password hashing/storage must be handled elsewhere
 */
const PASSWORD_REGEX =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@$%^&*()\[\]{}\-_=<>.,:;'"\~`#\\|\/+])[A-Za-z\d!@$%^&*()\[\]{}\-_=<>.,:;'"\~`#\\|\/+]{8,}$/;

/**
 * Normalize an email value for validation and storage comparisons.
 *
 * Current behavior:
 * - converts nullish/falsy input to an empty string
 * - trims surrounding whitespace
 * - lowercases the value
 *
 * @param {unknown} email
 * @returns {string}
 */
export const normalizeEmail = (email) =>
	String(email ?? '')
		.trim()
		.toLowerCase();

/**
 * Normalize a username value before validation or comparisons.
 *
 * Current behavior:
 * - converts nullish/falsy input to an empty string
 * - trims surrounding whitespace
 *
 * Notes:
 * - does not remove internal characters
 * - does not silently repair invalid usernames
 *
 * @param {unknown} username
 * @returns {string}
 */
export const normalizeUsername = (username) => String(username ?? '').trim();

/**
 * Check whether an email has a valid format.
 *
 * Notes:
 * - checks syntax only
 * - does not verify inbox ownership
 * - does not verify deliverability
 *
 * @param {unknown} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => validator.isEmail(normalizeEmail(email));

/**
 * Check whether a username matches the allowed format.
 *
 * Notes:
 * - validates only the normalized value
 * - does not check whether the username is already taken
 *
 * @param {unknown} username
 * @returns {boolean}
 */
export const isValidUsername = (username) => {
	const normalizedUsername = normalizeUsername(username);
	return USERNAME_REGEX.test(normalizedUsername);
};

/**
 * Check whether a password matches the required strength rules.
 *
 * Notes:
 * - returns a single pass/fail result
 * - more detailed password feedback can be added elsewhere if needed
 *
 * @param {unknown} password
 * @returns {boolean}
 */
export const isValidPassword = (password) =>
	PASSWORD_REGEX.test(String(password ?? ''));

/**
 * Perform a lightweight email sanity check.
 *
 * Current rule:
 * - keeps email length within a practical maximum
 *
 * Why this exists:
 * - format validation alone is not the only concern
 * - long malformed inputs should still be rejected early
 *
 * @param {unknown} email
 * @returns {boolean}
 */
export const isSafeEmail = (email) => {
	const normalizedEmail = normalizeEmail(email);
	return normalizedEmail.length > 0 && normalizedEmail.length <= 254;
};

/**
 * Flash an error, optionally reopen a modal, then redirect home.
 *
 * Intended use:
 * - shared validator/controller failure path for simple form flows
 *
 * Notes:
 * - flashKey is intentionally generic
 * - callers can pass full translation keys such as:
 *   - auth:error.email_invalid
 *   - auth:signup.verify_email_invalid_link
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} flashKey
 * @param {string|false} [modal=false]
 * @returns {import('express').Response}
 */
export const fail = (req, res, flashKey, modal = false) => {
	req.flash('error', flashKey);

	if (modal) {
		req.flash('modal', modal);
	}

	return res.redirect('/');
};
