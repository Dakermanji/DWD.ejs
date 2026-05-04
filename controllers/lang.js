//! controllers/lang.js

import { SUPPORTED_LANGUAGE_SET } from '../config/languages.js';
import UserModel from '../models/User.js';
import { setLangCookie } from '../services/i18n/locale.js';

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
 * 2. If user is signed in -> update the locale in database
 * 3. Fallback to homepage
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
export async function changeLanguage(req, res) {
	const { lang } = req.params;
	const redirectTo = req.get('Referrer') || '/';

	if (!SUPPORTED_LANGUAGE_SET.has(lang)) {
		return res.redirect(redirectTo);
	}

	// Persist language only when it is supported by the application
	setLangCookie(res, lang);

	if (req.user && req.user.locale !== lang) {
		await UserModel.updateLocale(req.user.id, lang);
		req.user.locale = lang;
	}

	// Return the user to the previous page, or fallback to home
	return res.redirect(redirectTo);
}
