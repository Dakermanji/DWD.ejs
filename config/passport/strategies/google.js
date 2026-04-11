//! config/passport/strategies/google.js

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import env from '../../dotenv.js';
import { createOAuthVerifyCallback } from '../../../services/auth/oauth.js';

/**
 * Register Google OAuth strategy.
 *
 * Responsibilities:
 * - configure Passport Google strategy
 * - delegate shared account logic to reusable OAuth callback
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
			createOAuthVerifyCallback({
				provider: 'google',
				getProviderUserId: (profile) => profile?.id,
				getEmail: (profile) => profile?.emails?.[0]?.value,
			}),
		),
	);
}

export default setupGoogleStrategy;
