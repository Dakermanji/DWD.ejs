//! controllers/auth/completeLocalSignup.js

import logger from '../../config/logger.js';
import UserModel from '../../models/User.js';
import AuthTokenModel from '../../models/AuthToken.js';
import { verifyToken, tokenTypes } from '../../services/auth/verifyToken.js';
import { hashPassword } from '../../services/auth/password.js';

/**
 * Complete local signup after email verification.
 *
 * Responsibilities:
 * - merge validation errors collected by middleware
 * - check username availability
 * - verify that the signup token exists and is still valid
 * - continue the account completion flow when all checks pass
 *
 * Current flow:
 * - reads normalized input from req.body
 * - checks whether the requested username is already taken
 * - verifies the signup token
 * - hashes the password
 * - updates the user with username and password
 * - consumes the signup token
 *
 * Future:
 * - log the user in with passport
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function completeLocalSignup(req, res) {
	const errors = [...(req.validationErrors || [])];
	const { token, username, password } = req.body;

	try {
		const hasUsernameFormatError = errors.includes(
			'auth:error.username_invalid',
		);

		// Check username availability only when the format is already valid.
		if (!hasUsernameFormatError) {
			const exists = await UserModel.usernameExists(username);

			if (exists) {
				errors.push('auth:error.username_taken');
			}
		}

		// Stop early if request validation already failed.
		if (errors.length > 0) {
			req.flash('errors', errors);
			req.flash('modal', 'complete_signup');
			return res.redirect('/');
		}

		// Verify the signup token after cheap validation passes.
		const tokenResult = await verifyToken(token, tokenTypes.signup);

		if (!tokenResult.ok) {
			req.flash('error', 'auth:signup.verify_email_invalid_link');
			req.flash('modal', 'complete_signup');
			return res.redirect('/');
		}

		// Hash password.
		const hashedPassword = await hashPassword(password);

		// Complete signup in DB.
		const user = await UserModel.completeLocalSignupById(
			tokenResult.userId,
			username,
			hashedPassword,
		);

		if (!user) {
			req.flash('error', 'common:error_generic');
			return res.redirect('/');
		}

		// Consume token.
		const tokenMarkedUsed = await AuthTokenModel.markTokenUsed(
			tokenResult.tokenHash,
			tokenTypes.signup,
			user.id,
		);

		if (!tokenMarkedUsed) {
			logger.error('Failed to mark signup token as used', {
				type: 'auth',
				controller: 'completeLocalSignup',
				userId: user.id,
				tokenHash: tokenResult.tokenHash,
			});
		}

		// Log user in with passport here when ready.

		req.flash('info', 'common:coming_soon');
		return res.redirect('/');
	} catch (err) {
		logger.error(err.message, {
			type: 'auth',
			controller: 'completeLocalSignup',
		});

		req.flash('error', 'common:error_generic');
		return res.redirect('/');
	}
}

export default completeLocalSignup;
