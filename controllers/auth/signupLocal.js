//! controllers/auth/signupLocal.js

import { SUPPORTED_LANGUAGE_CODES } from '../../config/languages.js';
import logger from '../../config/logger.js';
import UserModel from '../../models/User.js';
import AuthTokenModel from '../../models/AuthToken.js';
import tokens from '../../utils/auth/tokens.js';
// import emailService from '../../services/auth/email.js';

/**
 * Handle local signup step 1.
 *
 * Expected input:
 * - req.body.email must already be validated by middleware
 *
 * Current behavior:
 * - if the email does not exist, create a pending local user
 * - create an email verification token for that user
 * - if the email already exists, do not reveal that to the user
 * - always flash the same success message on normal flow
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function signupLocal(req, res) {
	const { email } = req.body;
	const rawLocale = req.locale || 'en';
	const locale = SUPPORTED_LANGUAGE_CODES.includes(rawLocale)
		? rawLocale
		: 'en';

	try {
		const existingUser = await UserModel.findByEmailBasic(email);

		// Only continue the signup flow for emails not already registered.
		// The response stays the same either way to avoid enumeration.
		if (!existingUser) {
			const user = await UserModel.createLocalPendingUser(
				email,
				email,
				locale,
			);
			const rawToken = tokens.createAuthToken();
			const tokenHash = tokens.hashAuthToken(rawToken);
			const expiresAt = new Date(Date.now() + tokens.AUTH_EXPIRY_TIME);

			await AuthTokenModel.createEmailVerificationToken({
				userId: user.id,
				tokenHash,
				expiresAt,
			});

			// await emailService.sendSignupEmail(
			// 	user.email,
			// 	rawToken,
			// 	user.locale,
			// );
		}

		req.flash('success', 'auth:success.signup_email_sent');
		return res.redirect('/');
	} catch (err) {
		logger.error(err.message, {
			type: 'auth',
			controller: 'signupLocal',
			email,
		});

		req.flash('error', 'auth:error.generic');
		return res.redirect('/');
	}
}

export default signupLocal;
