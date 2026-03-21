//! config/passport/strategies/local.js

/**
 * Local authentication strategy scaffold
 *
 * Responsibilities:
 * - Register Passport local strategy
 *
 * Why this file exists:
 * - Keeps local auth isolated from OAuth strategies
 * - Prepares sign in with email/username and password
 *
 * Notes:
 * - Verification logic is intentionally deferred
 * - Database checks will be added later
 */

import { Strategy as LocalStrategy } from 'passport-local';

/**
 * Register local authentication strategy
 *
 * @param {import('passport').PassportStatic} passport
 */
function setupLocalStrategy(passport) {
	passport.use(
		new LocalStrategy(
			{
				usernameField: 'email',
				passwordField: 'password',
			},
			async (_email, _password, done) => {
				return done(null, false);
			},
		),
	);
}

export default setupLocalStrategy;
