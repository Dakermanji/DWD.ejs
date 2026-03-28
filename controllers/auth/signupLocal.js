//! controllers/auth/signupLocal.js

import { SUPPORTED_LANGUAGE_CODES } from '../../config/languages.js';
import logger from '../../config/logger.js';
import UserModel from '../../models/User.js';
import AuthTokenModel from '../../models/AuthToken.js';
import tokens from '../../utils/auth/tokens.js';
import emailService from '../../services/auth/email.js';
import { tokenTypes } from '../../services/auth/verifyToken.js';

/**
 * Handle local signup step 1.
 *
 * Flow:
 * - receives a validated and normalized email
 * - resolves a supported locale for the pending user
 * - checks whether the email is already registered
 * - if not registered:
 *   - creates a pending local user
 *   - creates an email verification token
 *   - sends the signup email
 * - always returns the same success response on normal flow
 *
 * Why the response is generic:
 * - prevents email enumeration
 *
 * Notes:
 * - this step does not complete registration yet
 * - password and username are collected later
 * - locale is stored now so auth emails can match the user's language
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function signupLocal(req, res) {
	const { email } = req.body;

	// Keep only supported application languages.
	// Fallback to English for anything unknown or missing.
	const rawLocale = req.locale || 'en';
	const locale = SUPPORTED_LANGUAGE_CODES.includes(rawLocale)
		? rawLocale
		: 'en';

	try {
		const existingUser = await UserModel.findByEmailBasic(email);

		// Continue the signup flow only for emails that are not yet registered.
		// The success response stays identical either way to avoid enumeration.
		if (!existingUser) {
			const user = await UserModel.createLocalPendingUser(email, locale);

			// Store only the token hash in the database.
			// The raw token is sent to the user by email.
			const rawToken = tokens.createAuthToken();
			const tokenHash = tokens.hashAuthToken(rawToken);
			const expiresAt = new Date(Date.now() + tokens.AUTH_EXPIRY_TIME);

			await AuthTokenModel.createToken(
				user.id,
				tokenHash,
				expiresAt,
				tokenTypes.signup,
			);

			emailService.sendSignupEmail(user.email, rawToken, user.locale);
		}

		req.flash('success', 'auth:signup.success_email_sent');
		return res.redirect('/');
	} catch (err) {
		logger.error(err.message, {
			type: 'auth',
			controller: 'signupLocal',
			email,
		});

		req.flash('error', 'common:error_generic');
		return res.redirect('/');
	}
}

export default signupLocal;
