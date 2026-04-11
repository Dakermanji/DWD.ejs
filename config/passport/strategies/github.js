//! config/passport/strategies/github.js

import { Strategy as GitHubStrategy } from 'passport-github2';
import env from '../../dotenv.js';
import { createOAuthVerifyCallback } from '../../../services/auth/oauth.js';

/**
 * Register GitHub OAuth strategy.
 *
 * Responsibilities:
 * - configure Passport GitHub strategy
 * - delegate shared account logic to reusable OAuth callback
 *
 * @param {import('passport').PassportStatic} passport
 */
function setupGithubStrategy(passport) {
	passport.use(
		new GitHubStrategy(
			{
				clientID: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
				callbackURL: env.GITHUB_CALLBACK_URL,
				passReqToCallback: true,
				scope: ['user:email'],
			},
			createOAuthVerifyCallback({
				provider: 'github',
				getProviderUserId: (profile) => profile?.id,
				getEmail: (profile) => profile?.emails?.[0]?.value,
				resolveEmail: ({ accessToken }) =>
					fetchGithubPrimaryEmail(accessToken),
			}),
		),
	);
}

export default setupGithubStrategy;
