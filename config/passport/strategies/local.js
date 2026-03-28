//! config/passport/strategies/local.js

import { Strategy as LocalStrategy } from 'passport-local';
import UserModel from '../../../models/User.js';
import { comparePassword } from '../../../services/auth/password.js';

/**
 * Generic sign-in failure message key.
 *
 * Keep this the same across auth failures
 * to avoid leaking account state.
 */
const INVALID_CREDENTIALS_KEY = 'auth:signin.invalid_credentials';

/**
 * Register local authentication strategy.
 *
 * Responsibilities:
 * - accept identifier + password from the sign-in form
 * - read identifierType from req.body
 * - load the matching completed local user
 * - reject blocked users
 * - verify the password
 * - return a safe user object to Passport
 *
 * Security notes:
 * - do not reveal whether the account exists
 * - do not reveal whether the password is wrong
 * - do not reveal whether local signup is incomplete
 *
 * Current assumptions:
 * - completed local accounts already have username
 * - completed local accounts already have hashed_password
 * - local completed signup results in a verified account
 * - OAuth accounts are stored separately and are not handled here
 *
 * Future checks:
 * - failed login attempts by user
 * - failed login attempts by IP
 * - password reset / forced re-auth states
 *
 * @param {import('passport').PassportStatic} passport
 */
function setupLocalStrategy(passport) {
	passport.use(
		'local',
		new LocalStrategy(
			{
				usernameField: 'identifier',
				passwordField: 'password',
				passReqToCallback: true,
			},
			async (req, identifier, password, done) => {
				try {
					const identifierType = req.body?.identifierType;

					// Basic request-shape guard.
					// Full validation should still happen in middleware.
					if (
						typeof identifier !== 'string' ||
						typeof password !== 'string' ||
						(identifierType !== 'email' &&
							identifierType !== 'username')
					) {
						return done(null, false, {
							message: INVALID_CREDENTIALS_KEY,
						});
					}

					const user = await UserModel.findForLocalSignin(
						identifier,
						identifierType,
					);

					// User does not exist
					// or local signup is not completed
					if (!user) {
						return done(null, false, {
							message: INVALID_CREDENTIALS_KEY,
						});
					}

					// Admin block check
					if (user.is_blocked) {
						return done(null, false, {
							message: INVALID_CREDENTIALS_KEY,
						});
					}

					const isPasswordValid = await comparePassword(
						password,
						user.hashed_password,
					);

					if (!isPasswordValid) {
						return done(null, false, {
							message: INVALID_CREDENTIALS_KEY,
						});
					}

					return done(null, {
						id: user.id,
						email: user.email,
						username: user.username,
					});
				} catch (error) {
					return done(error);
				}
			},
		),
	);
}

export default setupLocalStrategy;
