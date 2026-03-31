//! config/passport/strategies/local.js

import { Strategy as LocalStrategy } from 'passport-local';
import UserModel from '../../../models/User.js';
import { comparePassword } from '../../../services/auth/password.js';
import {
	getRequestMeta,
	logAuthEvent,
	getAuthSecurityState,
	updateSigninState,
	isLocked,
} from './localSecurity.js';

/**
 * Generic sign-in failure message key.
 *
 * Keep this the same across auth failures
 * to avoid leaking account state.
 */
const INVALID_CREDENTIALS_KEY = 'auth:error.invalid_credentials';

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
					const identifierType = req.body.identifierType;
					const requestMeta = getRequestMeta(req);

					const user = await UserModel.findForLocalSignin(
						identifier,
						identifierType,
					);

					// User does not exist
					// or local signup is not completed
					if (!user) {
						await updateSigninState({
							successful: false,
							userId: null,
							identifier,
						});

						await logAuthEvent({
							userId: null,
							identifier,
							eventType: 'signin_failed',
							...requestMeta,
						});

						return done(null, false, {
							message: INVALID_CREDENTIALS_KEY,
						});
					}
					const authSecurity = await getAuthSecurityState({
						userId: user?.id ?? null,
						identifier,
					});

					if (user.is_blocked) {
						await logAuthEvent({
							userId: user.id,
							identifier,
							eventType: 'signin_blocked',
							...requestMeta,
						});

						return done(null, false, {
							message: INVALID_CREDENTIALS_KEY,
						});
					}

					if (isLocked(authSecurity)) {
						await logAuthEvent({
							userId: user?.id ?? null,
							identifier,
							eventType: 'signin_locked',
							...requestMeta,
						});

						return done(null, false, {
							message: INVALID_CREDENTIALS_KEY,
						});
					}

					const isPasswordValid = await comparePassword(
						password,
						user.hashed_password,
					);

					if (!isPasswordValid) {
						await updateSigninState({
							successful: false,
							userId: user.id,
							identifier,
						});

						await logAuthEvent({
							userId: user.id,
							identifier,
							eventType: 'signin_failed',
							...requestMeta,
						});

						return done(null, false, {
							message: INVALID_CREDENTIALS_KEY,
						});
					}

					await updateSigninState({
						successful: true,
						userId: user.id,
						identifier,
					});

					await logAuthEvent({
						userId: user.id,
						identifier,
						eventType: 'signin_success',
						...requestMeta,
					});

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
