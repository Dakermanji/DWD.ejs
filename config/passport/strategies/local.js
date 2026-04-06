//! config/passport/strategies/local.js

import { Strategy as LocalStrategy } from 'passport-local';
import UserModel from '../../../models/User.js';
import { comparePassword } from '../../../services/auth/password.js';
import {
	getAuthSecurityState,
	isLocked,
	lockSigninIfNeeded,
	logAuthEvent,
	updateSigninState,
} from './localSecurity.js';
import { getRequestMeta } from '../../../services/http/requestMeta.js';

/**
 * Generic sign-in failure message key.
 *
 * Keep this the same across auth failures
 * to avoid leaking account state.
 */
const INVALID_CREDENTIALS_KEY = 'auth:error.invalid_credentials';

/**
 * Build the safe user object returned to Passport.
 *
 * @param {{
 *   id: string,
 *   email: string,
 *   username: string
 * }} user
 * @returns {{
 *   id: string,
 *   email: string,
 *   username: string
 * }}
 */
function buildSafeUser(user) {
	return {
		id: user.id,
		email: user.email,
		username: user.username,
	};
}

/**
 * Handle a failed sign-in attempt.
 *
 * Responsibilities:
 * - update mutable auth security state
 * - optionally evaluate and apply account lock
 * - log the auth event
 * - return the generic Passport failure response
 *
 * Notes:
 * - use shouldUpdateState=false for failures that should not
 *   affect failed_signin_count (for example blocked/locked users)
 *
 * @param {{
 *   done: Function,
 *   identifier: string,
 *   userId?: string | null,
 *   eventType: string,
 *   requestMeta: {
 *     ipAddress: string | null,
 *     userAgent: string | null,
 *     identifier: string | null
 *   },
 *   shouldUpdateState?: boolean,
 *   shouldCheckLock?: boolean
 * }} params
 * @returns {Promise<void>}
 */
async function failSignin({
	done,
	identifier,
	userId = null,
	eventType,
	requestMeta,
	shouldUpdateState = false,
	shouldCheckLock = false,
}) {
	if (shouldUpdateState) {
		await updateSigninState({
			successful: false,
			userId,
			identifier,
		});
	}

	if (shouldCheckLock) {
		await lockSigninIfNeeded({
			userId,
			identifier,
		});
	}

	await logAuthEvent({
		userId,
		identifier,
		eventType,
		...requestMeta,
	});

	return done(null, false, {
		message: INVALID_CREDENTIALS_KEY,
	});
}

/**
 * Handle a successful sign-in attempt.
 *
 * Responsibilities:
 * - reset auth security failure state
 * - log successful sign-in event
 * - return the safe user object to Passport
 *
 * @param {{
 *   done: Function,
 *   user: {
 *     id: string,
 *     email: string,
 *     username: string
 *   },
 *   identifier: string,
 *   requestMeta: {
 *     ipAddress: string | null,
 *     userAgent: string | null,
 *     identifier: string | null
 *   }
 * }} params
 * @returns {Promise<void>}
 */
async function succeedSignin({ done, user, identifier, requestMeta }) {
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

	return done(null, buildSafeUser(user));
}

/**
 * Register local authentication strategy.
 *
 * Responsibilities:
 * - accept identifier + password from the sign-in form
 * - read identifierType from req.body
 * - load the matching completed local user
 * - reject blocked users
 * - reject locked users
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
						return await failSignin({
							done,
							identifier,
							userId: null,
							eventType: 'signin_failed',
							requestMeta,
							shouldUpdateState: true,
							shouldCheckLock: false,
						});
					}

					const authSecurity = await getAuthSecurityState({
						userId: user.id,
						identifier,
					});

					if (user.is_blocked) {
						return await failSignin({
							done,
							identifier,
							userId: user.id,
							eventType: 'signin_blocked',
							requestMeta,
							shouldUpdateState: false,
							shouldCheckLock: false,
						});
					}

					if (isLocked(authSecurity)) {
						return await failSignin({
							done,
							identifier,
							userId: user.id,
							eventType: 'signin_locked',
							requestMeta,
							shouldUpdateState: false,
							shouldCheckLock: false,
						});
					}

					const isPasswordValid = await comparePassword(
						password,
						user.hashed_password,
					);

					if (!isPasswordValid) {
						return await failSignin({
							done,
							identifier,
							userId: user.id,
							eventType: 'signin_failed',
							requestMeta,
							shouldUpdateState: true,
							shouldCheckLock: true,
						});
					}

					return await succeedSignin({
						done,
						user,
						identifier,
						requestMeta,
					});
				} catch (error) {
					return done(error);
				}
			},
		),
	);
}

export default setupLocalStrategy;
