//! controllers/auth/completeLocalSignup.js

import logger from '../../config/logger.js';
import UserModel from '../../models/User.js';

/**
 * Handle local signup completion.
 *
 * Temporary behavior:
 * - placeholder controller so the route exists and the app does not crash
 *
 * Future flow:
 * - validate the completion token
 * - check username availability
 * - hash password
 * - update the local user
 * - consume the auth token
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function completeLocalSignup(req, res) {
	const errors = [...(req.validationErrors || [])];
	const { username } = req.body;

	try {
		const hasUsernameFormatError = errors.includes(
			'auth:error.username_invalid',
		);

		if (!hasUsernameFormatError) {
			const usernameExists = await UserModel.usernameExists(username);

			if (usernameExists) {
				errors.push('auth:error.username_taken');
			}
		}

		if (errors.length > 0) {
			req.flash('errors', errors);
			req.flash('modal', 'complete_signup');
			return res.redirect('/');
		}

		// continue real signup completion flow here
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
