//! services/http/response.js

/**
 * Flash an error message, optionally reopen a modal, then redirect.
 *
 * Responsibilities:
 * - set flash error message
 * - optionally set modal to reopen UI state
 * - redirect to target route
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} flashKey
 * @param {{
 *   modal?: string | false,
 *   to?: string
 * }} [options]
 * @returns {import('express').Response}
 */
export function fail(req, res, flashKey, { modal = false, to = '/' } = {}) {
	req.flash('error', flashKey);

	if (modal) {
		req.flash('modal', modal);
	}

	return res.redirect(to);
}

/**
 * Flash a success message, optionally reopen a modal, then redirect.
 *
 * Responsibilities:
 * - set flash success message
 * - optionally set modal to reopen UI state
 * - redirect to target route
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string | false} flashKey
 * @param {{
 *   modal?: string | false,
 *   to?: string
 * }} [options]
 * @returns {import('express').Response}
 */
export function success(req, res, flashKey, { modal = false, to = '/' } = {}) {
	// set success flash message if provided
	if (flashKey) {
		req.flash('success', flashKey);
	}

	// optionally reopen modal (UI state)
	if (modal) {
		req.flash('modal', modal);
	}

	return res.redirect(to);
}
