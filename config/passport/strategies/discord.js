//! config/passport/strategies/discord.js

import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import env from '../../dotenv.js';
import { createOAuthVerifyCallback } from '../../../services/auth/oauth.js';

/**
 * Fetch Discord user profile using the OAuth access token.
 *
 * Why this exists:
 * - passport-oauth2 does not provide a provider profile by default
 * - Discord user info must be fetched manually from the API
 *
 * @param {string} accessToken
 * @returns {Promise<{ id: string | null, email: string | null }>}
 */
async function fetchDiscordProfile(accessToken) {
	const response = await fetch('https://discord.com/api/users/@me', {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		return { id: null, email: null };
	}

	const profile = await response.json();

	return {
		id: profile?.id || null,
		email: profile?.email || null,
	};
}

/**
 * Register Discord OAuth strategy.
 *
 * Responsibilities:
 * - configure Passport Discord OAuth strategy
 * - fetch Discord profile manually
 * - delegate shared account logic to reusable OAuth callback
 *
 * @param {import('passport').PassportStatic} passport
 */
function setupDiscordStrategy(passport) {
	const sharedVerify = createOAuthVerifyCallback({
		provider: 'discord',
		getProviderUserId: (profile) => profile?.id,
		getEmail: (profile) => profile?.email,
	});

	const strategy = new OAuth2Strategy(
		{
			authorizationURL: 'https://discord.com/oauth2/authorize',
			tokenURL: 'https://discord.com/api/oauth2/token',
			clientID: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
			callbackURL: env.DISCORD_CALLBACK_URL,
			scope: ['identify', 'email'],
			state: true,
			pkce: false,
			passReqToCallback: true,
		},
		async (req, accessToken, refreshToken, _params, _profile, done) => {
			try {
				const profile = await fetchDiscordProfile(accessToken);

				return sharedVerify(
					req,
					accessToken,
					refreshToken,
					profile,
					done,
				);
			} catch (error) {
				return done(error);
			}
		},
	);

	passport.use('discord', strategy);
}

export default setupDiscordStrategy;
