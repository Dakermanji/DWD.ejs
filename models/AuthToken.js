//! models/AuthToken.js

import { queryRows } from '../config/database.js';

/**
 * Create an email verification token.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.tokenHash
 * @param {Date | string} params.expiresAt
 * @returns {Promise<{
 *   id: string,
 *   user_id: string,
 *   type: string,
 *   expires_at: Date,
 *   created_at: Date
 * } | null>}
 */
export async function createEmailVerificationToken({
	userId,
	tokenHash,
	expiresAt,
}) {
	const q = `
		INSERT INTO auth_tokens (user_id, token_hash, type, expires_at)
		VALUES ($1, $2, 'email_verification', $3)
		RETURNING id, user_id, type, expires_at, created_at
	`;

	const rows = await queryRows(q, [userId, tokenHash, expiresAt]);
	return rows[0] || null;
}

export default {
	createEmailVerificationToken,
};
