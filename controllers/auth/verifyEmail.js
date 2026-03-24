//! controllers/auth/verifyEmail.js

import logger from '../../config/logger.js';
import verifyEmailToken from '../../services/auth/verifyEmailToken.js';
import AuthTokenModel from '../../models/AuthToken.js';
/**
 * Verify email token.
 *
 * Flow:
 * - reads the raw token from the query string
 * - hashes the token before lookup
 * - loads the matching email verification token
 * - rejects invalid, expired, or already used tokens
 *
 * Notes:
 * - this step only validates the token record for now
 * - user verification is handled afterward
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function verifyEmail(req, res) {
	const { token } = req.query;

	try {
		// Check if token is valid
		const result = await verifyEmailToken(token);
		const authToken = await AuthTokenModel.findTokenByHash(
			result.tokenHash,
		);

		if (!result.ok) {
			req.flash('error', 'auth:signup.verify_email_invalid_link');
			return res.redirect('/');
		}

		return res.send('TODO: token is valid');
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
