//! config/passport/serializeUser.js

/**
 * Passport session serialization
 *
 * Responsibilities:
 * - Define how the authenticated user is stored in session
 * - Define how the user is restored from session
 *
 * Why this file exists:
 * - Keeps session-specific Passport logic separate
 * - Makes serialization easy to update later
 */

import User from '../../models/User.js';

/**
 * Register Passport serializeUser and deserializeUser handlers.
 *
 * @param {import('passport').PassportStatic} passport
 */
function setupPassportSession(passport) {
	passport.serializeUser((user, done) => {
		done(null, user?.id ?? null);
	});

	passport.deserializeUser(async (userId, done) => {
		try {
			if (!userId) {
				return done(null, false);
			}

			const user = await User.findByIdForSession(userId);

			if (!user) {
				return done(null, false);
			}

			return done(null, user);
		} catch (error) {
			return done(error);
		}
	});
}

export default setupPassportSession;
