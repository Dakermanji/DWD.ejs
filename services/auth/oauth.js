//! services/auth/oauth.js

import User from '../../models/User.js';
import UserProvider from '../../models/UserProvider.js';

/**
 * Normalize OAuth provider email.
 *
 * Responsibilities:
 * - safely read email from provider profile
 * - normalize casing and spacing
 * - return null when email is missing
 *
 * @param {string | undefined | null} email
 * @returns {string | null}
 */
function normalizeOAuthEmail(email) {
	if (typeof email !== 'string') {
		return null;
	}

	const normalizedEmail = email.toLowerCase().trim();

	return normalizedEmail || null;
}

/**
 * Build a reusable Passport OAuth verify callback.
 *
 * Responsibilities:
 * - keep provider strategy files small
 * - centralize shared OAuth sign-in/sign-up logic
 * - support multiple providers with the same account-link flow
 *
 * Expected flow:
 * - extract provider account id
 * - extract and normalize email
 * - find existing linked account
 * - otherwise find user by email
 * - create OAuth user if needed
 * - create provider link if needed
 * - load session-safe user
 *
 * @param {object} options
 * @param {'google' | 'github' | 'discord'} options.provider
 * @param {(profile: any) => string | number | null | undefined} options.getProviderUserId
 * @param {(profile: any) => string | null | undefined} options.getEmail
 * @returns {(
 *   req: import('express').Request,
 *   accessToken: string,
 *   refreshToken: string,
 *   profile: any,
 *   done: (error: unknown, user?: Express.User | false | null) => void,
 * ) => Promise<void>}
 */
export function createOAuthVerifyCallback({
	provider,
	getProviderUserId,
	getEmail,
}) {
	/**
	 * Shared Passport OAuth verify callback.
	 *
	 * @param {import('express').Request} req
	 * @param {string} _accessToken
	 * @param {string} _refreshToken
	 * @param {any} profile
	 * @param {(error: unknown, user?: Express.User | false | null) => void} done
	 * @returns {Promise<void>}
	 */
	return async function oauthVerifyCallback(
		req,
		_accessToken,
		_refreshToken,
		profile,
		done,
	) {
		try {
			const locale = req?.locale || 'en';
			const providerUserId = getProviderUserId(profile);
			const email = normalizeOAuthEmail(getEmail(profile));

			if (!providerUserId || !email) {
				return done(null, false);
			}

			const linkedUser = await UserProvider.findUserByProviderAccount(
				provider,
				String(providerUserId),
			);

			if (linkedUser) {
				return done(null, linkedUser);
			}

			let user = await User.findByEmailBasic(email);

			if (!user) {
				user = await User.createOAuthUser(email, locale, true);
			}

			await UserProvider.createLink(
				user.id,
				provider,
				String(providerUserId),
			);

			const sessionUser = await User.findByIdForSession(user.id);

			if (!sessionUser) {
				return done(null, false);
			}

			return done(null, sessionUser);
		} catch (error) {
			return done(error);
		}
	};
}
