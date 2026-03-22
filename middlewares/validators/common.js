//! middlewares/validators/common.js

/**
 * Shared validation helpers
 * -------------------------
 * Reusable helpers for auth and other request validation flows.
 *
 * Why this file exists:
 * - keeps validator middleware small
 * - centralizes normalization helpers
 * - centralizes common failure behavior
 */

import validator from 'validator';

/**
 * Normalize an email value.
 *
 * @param {*} email
 * @returns {string}
 */
export const normalizeEmail = (email) =>
	String(email || '')
		.trim()
		.toLowerCase();

/**
 * Normalize a username value.
 *
 * @param {*} username
 * @returns {string}
 */
export const normalizeUsername = (username) => String(username || '').trim();

/**
 * Check whether an email has a valid format.
 *
 * Notes:
 * - this checks format only
 * - it does not verify ownership or deliverability
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => validator.isEmail(normalizeEmail(email));

/**
 * Lightweight email sanity check.
 *
 * Current rule:
 * - keeps email length within a reasonable limit
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isSafeEmail = (email) => {
	const normalizedEmail = normalizeEmail(email);
	return normalizedEmail.length > 0 && normalizedEmail.length <= 254;
};

/**
 * Flash an error, optionally reopen a modal, then redirect.
 *
 * Notes:
 * - flashKey is intentionally generic
 * - callers can pass full keys like auth:error.email_invalid
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
