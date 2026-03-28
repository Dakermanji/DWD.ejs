//! controllers/auth/signinLocal.js

import passport from 'passport';

/**
 * Handle local sign-in.
 *
 * Expected input:
 * - req.body.identifier
 * - req.body.identifierType
 * - req.body.password
 *
 * Notes:
 * - actual credential verification is handled by Passport local strategy
 * - this controller is responsible for session login flow and redirects
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
export async function signinLocal(req, res, next) {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			return next(err);
		}

		// Authentication failed
		if (!user) {
			if (info?.message) {
				req.flash('error', info.message);
			} else {
				req.flash('error', 'auth:signin.invalid_credentials');
			}

			// Re-open login modal on next request
			req.flash('modal', 'login');

			return res.redirect('/');
		}

		// Authentication succeeded → establish login session
		req.logIn(user, (loginErr) => {
			if (loginErr) {
				return next(loginErr);
			}

			return res.redirect('/');
		});
	})(req, res, next);
}
