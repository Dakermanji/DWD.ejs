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
 *
 * Notes:
 * - Current implementation is a placeholder
 * - Real database lookup will be added later
 */

/**
 * Register Passport serializeUser and deserializeUser handlers
 *
 * @param {import('passport').PassportStatic} passport
 */
function setupPassportSession(passport) {
	passport.serializeUser((user, done) => {
		done(null, user?.id ?? null);
	});

	passport.deserializeUser((userId, done) => {
		done(null, userId ? { id: userId } : false);
	});
}

export default setupPassportSession;
