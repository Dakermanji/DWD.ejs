//! controllers/auth/google.js

import passport from 'passport';

/**
 * Start Google OAuth flow.
 *
 * Responsibilities:
 * - redirect the user to Google
 * - use one shared entry for signup and signin
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function googleCall(req, res, next) {
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		prompt: 'select_account',
	})(req, res, next);
}

/**
 * Handle Google OAuth callback.
 *
 * Responsibilities:
 * - complete Passport authentication
 * - redirect on failure
 * - redirect users without username to complete signup
 * - redirect authenticated users home
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function googleCallback(req, res, next) {
	passport.authenticate('google', (err, user) => {
		if (err) {
			return next(err);
		}
		console.log(req);

		if (!user) {
			req.flash('error', 'auth:error.oauth_failed');
			return res.redirect('/');
		}

		return req.logIn(user, (loginErr) => {
			if (loginErr) {
				return next(loginErr);
			}

			if (!user.username) {
				req.flash('modal', 'complete_signup_oauth');
				return res.redirect('/');
			}

			return res.redirect('/');
		});
	})(req, res, next);
}
