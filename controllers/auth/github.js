//! controllers/auth/github.js

import passport from 'passport';

/**
 * Start GitHub OAuth flow.
 *
 * Responsibilities:
 * - redirect the user to GitHub
 * - use one shared entry for signup and signin
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export function githubCall(req, res, next) {
	passport.authenticate('github', {
		scope: ['user:email'],
	})(req, res, next);
}

/**
 * Handle GitHub OAuth callback.
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
export function githubCallback(req, res, next) {
	passport.authenticate('github', (err, user) => {
		if (err) {
			return next(err);
		}

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
