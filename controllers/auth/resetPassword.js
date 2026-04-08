//! controllers/auth/resetPassword.js

import logger from '../../config/logger.js';
import { SUPPORTED_LANGUAGE_SET } from '../../config/languages.js';
import { verifyToken, tokenTypes } from '../../services/auth/verifyToken.js';

/**
 * Open the reset-password modal when the reset link token is valid.
 *
 * Flow:
 * - reads the raw token and optional lang from the query string
 * - syncs the site language with the language used in the email link
 * - validates the password-reset token without consuming it
 * - stores the raw token in session for the next POST step
 * - redirects home and opens the reset-password modal
 *
 * Notes:
 * - this controller does not change any user data
 * - this controller does not consume the token
 * - token consumption should happen only after the new password is submitted successfully
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function getResetPassword(req, res) {
	const { token, lang } = req.query;

	try {
		// Ensure the website opens in the same language as the email when possible.
		const safeLang = SUPPORTED_LANGUAGE_SET.has(lang) ? lang : 'en';
		res.cookie('lang', safeLang, {
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 1000 * 60 * 60 * 24 * 30,
		});

		// Reject missing or malformed links early.
		if (!token) {
			req.flash('error', 'auth:error.reset_password_invalid_link');
			return res.redirect('/');
		}

		// Validate the reset token before opening the modal.
		const result = await verifyToken(token, tokenTypes.passwordReset);
		if (!result?.ok) {
			req.flash('error', 'auth:error.reset_password_invalid_link');
			return res.redirect('/');
		}

		// Keep the raw token for the password submission step.
		req.session.token = token;

		// Redirect home and open the reset-password modal.
		req.flash('modal', 'reset_password');
		return res.redirect('/');
	} catch (err) {
		logger.error(err.message, {
			type: 'auth',
			controller: 'getResetPassword',
			tokenType: tokenTypes.passwordReset,
		});

		req.flash('error', 'common:error.generic');
		return res.redirect('/');
	}
}

export default getResetPassword;
