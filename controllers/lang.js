//! controllers/lang.js

import { SUPPORTED_LANGUAGE_SET } from '../config/languages.js';

/**
 * Language Controller
 *
 * Contains request handlers related to language selection.
 */

/**
 * Update the user's language preference cookie, then redirect back.
 *
 * If the provided language is supported, it is stored in a cookie
 * so the app can use it on subsequent requests.
 *
 * Redirect priority:
 * 1. Back to the referring page
 * 2. Fallback to homepage
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
export function changeLanguage(req, res) {
	const { lang } = req.params;

	// Persist language only when it is supported by the application
	if (SUPPORTED_LANGUAGE_SET.has(lang)) {
		res.cookie('lang', lang, {
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 1000 * 60 * 60 * 24 * 30,
		});
	}

	// Return the user to the previous page, or fallback to home
	res.redirect(req.get('Referrer') || '/');
}
