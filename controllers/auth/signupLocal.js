//! controllers/auth/signupLocal.js

import logger from '../../config/logger.js';
import UserModel from '../../models/User.js';

/**
 * Handle local signup step 1.
 *
 * Expected input:
 * - req.body.email must already be validated by middleware
 *
 * Current behavior:
 * - if the email does not exist, create a pending local user
 * - if the email already exists, do not reveal that to the user
 * - always flash the same success message on normal flow
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function signupLocal(req, res) {
	const { email } = req.body;

	try {
		const existingUser = await UserModel.findByEmailBasic(email);

		// Only continue the signup flow for emails not already registered.
		// The response stays the same either way to avoid enumeration.
		if (!existingUser) {
			await UserModel.createLocalPendingUser(email, email);

			// TODO: create signup token
			// TODO: send signup email
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
