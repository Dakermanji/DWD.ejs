//! controllers/auth/completeLocalSignup.js

import logger from '../../config/logger.js';

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
	try {
		req.flash('info', 'CompleteLocalSignup');
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
