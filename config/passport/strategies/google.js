//! config/passport/strategies/google.js

/**
 * Google OAuth strategy scaffold
 *
 * Responsibilities:
 * - Register Passport Google OAuth 2.0 strategy
 *
 * Why this file exists:
 * - Keeps Google auth configuration isolated
 * - Prepares future account linking/sign in flow
 *
 * Notes:
 * - Strategy is intentionally not registered yet
 * - Environment variables and DB logic will be added later
 */

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import env from '../../dotenv.js';
import User from '../../../models/User.js';
import UserProvider from '../../../models/UserProvider.js';

/**
 * Register Google OAuth strategy.
 *
 * Flow:
 * - find existing Google provider link
 * - otherwise find user by email
 * - create user if needed
 * - create provider link if needed
 * - return internal user to Passport
 *
 * @param {import('passport').PassportStatic} passport
 */
function setupGoogleStrategy(passport) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				callbackURL: env.GOOGLE_CALLBACK_URL,
				passReqToCallback: true,
				scope: ['profile', 'email'],
			},
			async (req, _accessToken, _refreshToken, profile, done) => {
				try {
					const locale = req?.locale || 'en';
					const provider = 'google';
					const providerUserId = profile?.id;
					const email = profile?.emails?.[0]?.value
						?.toLowerCase()
						?.trim();

					if (!providerUserId || !email) {
						return done(null, false);
					}

					const linkedUser =
						await UserProvider.findUserByProviderAccount(
							provider,
							providerUserId,
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
						providerUserId,
					);

					const sessionUser = await User.findByIdForSession(user.id);

					if (!sessionUser) {
						return done(null, false);
					}

					return done(null, sessionUser);
				} catch (error) {
					return done(error);
				}
			},
		),
	);
}

export default setupGoogleStrategy;
