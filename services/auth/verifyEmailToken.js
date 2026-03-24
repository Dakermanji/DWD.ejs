//! services/auth/verifyEmailToken.js

import AuthTokenModel from '../../models/AuthToken.js';
import tokens from '../../utils/auth/tokens.js';

/**
 * Validate an email verification token.
 *
 * Responsibilities:
 * - hash the raw token
 * - load the matching auth token
 * - reject missing, expired, or already used tokens
 *
 * Notes:
 * - does not update the user
 * - does not consume the token
 *
 * @param {string} rawToken
 * @returns {Promise<{ ok: true, authToken: object } | { ok: false }>}
 */
export async function verifyEmailToken(rawToken) {
	const tokenHash = tokens.hashAuthToken(rawToken);
	const authToken = await AuthTokenModel.findTokenByHash(
		tokenHash,
		'email_verification',
	);

	if (!authToken) {
		return { ok: false };
	}

	if (new Date(authToken.expires_at) <= new Date()) {
		return { ok: false };
	}

	if (authToken.used_at) {
		return { ok: false };
	}

	return {
		ok: true,
		userId: authToken.user_id,
		tokenHash,
	};
}

export default verifyEmailToken;
