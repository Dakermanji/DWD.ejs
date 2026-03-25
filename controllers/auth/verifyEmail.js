//! controllers/auth/verifyEmail.js

import logger from '../../config/logger.js';
import UserModel from '../../models/User.js';
import verifyEmailToken from '../../services/auth/verifyEmailToken.js';

/**
 * Handle email verification.
 *
 * Flow:
 * - reads the raw token from the query string
 * - validates the token through the auth service
 * - marks the user email as verified
 * - stores the raw token in session for signup completion
 * - redirects home and opens the complete-signup modal
 *
 * Notes:
 * - the token is not consumed here
 * - token consumption happens after username/password are submitted
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function verifyEmail(req, res) {
	const { token } = req.query;

	try {
		// Ensure the verification token is valid before changing user state.
		const result = await verifyEmailToken(token);
		if (!result.ok) {
			req.flash('error', 'auth:signup.verify_email_invalid_link');
			return res.redirect('/');
		}

		// Mark the user email as verified.
		const updated = await UserModel.updateIsVerifiedById(
			result.userId,
			true,
		);
		if (!updated) {
			req.flash('error', 'common:error_generic');
			return res.redirect('/');
		}

		// Keep the raw token for the next step where signup is completed.
		req.session.completeSignup = token;

		// Redirect home and open the complete-signup modal.
		req.flash('modal', 'complete_signup_local');
		return res.redirect('/');
	} catch (err) {
		logger.error(err.message, {
			type: 'auth',
			controller: 'verifyEmail',
		});

		req.flash('error', 'common:error_generic');
		return res.redirect('/');
	}
}

export default verifyEmail;
