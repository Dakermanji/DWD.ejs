//! config/passport/strategies/github.js

import { Strategy as GitHubStrategy } from 'passport-github2';
import env from '../../dotenv.js';
import { createOAuthVerifyCallback } from '../../../services/auth/oauth.js';

/**
 * Fetch a usable GitHub email through the authenticated emails API.
 *
 * Why this exists:
 * - GitHub profile email can be missing even with user:email scope
 * - the emails API returns primary and verified addresses
 *
 * Selection rules:
 * - prefer primary + verified
 * - otherwise use the first verified email
 * - otherwise return null
 *
 * @param {object} params
 * @param {string} params.accessToken
 * @returns {Promise<string | null>}
 */
async function resolveGithubEmail({ accessToken }) {
	if (!accessToken) {
		return null;
	}

	const response = await fetch('https://api.github.com/user/emails', {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${accessToken}`,
			'X-GitHub-Api-Version': '2022-11-28',
			'User-Agent': 'DWD.ejs',
		},
	});

	if (!response.ok) {
		return null;
	}

	const emails = await response.json();

	if (!Array.isArray(emails) || emails.length === 0) {
		return null;
	}

	const primaryVerifiedEmail = emails.find(
		(emailEntry) => emailEntry?.primary && emailEntry?.verified,
	);

	if (primaryVerifiedEmail?.email) {
		return primaryVerifiedEmail.email;
	}

	const verifiedEmail = emails.find((emailEntry) => emailEntry?.verified);

	return verifiedEmail?.email || null;
}

/**
 * Register GitHub OAuth strategy.
 *
 * Responsibilities:
 * - configure Passport GitHub strategy
 * - delegate shared account logic to reusable OAuth callback
 * - fallback to GitHub emails API when profile email is missing
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
				resolveEmail: resolveGithubEmail,
			}),
		),
	);
}

export default setupGithubStrategy;
