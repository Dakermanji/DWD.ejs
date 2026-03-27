//! models/AuthToken.js

import { query, queryRows } from '../config/database.js';

/**
 * Create a token.
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
export async function createToken(userId, tokenHash, expiresAt, type) {
	const q = `
		INSERT INTO auth_tokens (user_id, token_hash, type, expires_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id, user_id, type, expires_at, created_at
	`;

	const rows = await queryRows(q, [userId, tokenHash, type, expiresAt]);
	return rows[0] || null;
}

/**
 * Find a token by its hash.
 *
 * Responsibilities:
 * - Retrieve a token matching the given hash
 *
 * Notes:
 * - Does not check expiry or usage state
 * - Returns null if no matching token is found
 *
 * @param {string} tokenHash
 * @returns {Promise<{
 *   id: string,
 *   user_id: string,
 *   token_hash: string,
 *   type: string,
 *   expires_at: Date,
 *   used_at: Date | null,
 *   created_at: Date
 * } | null>}
 */
export async function findTokenByHash(tokenHash, type) {
	const q = `
		SELECT
			id,
			user_id,
			token_hash,
			type,
			expires_at,
			used_at,
			created_at
		FROM auth_tokens
		WHERE token_hash = $1
			AND type = $2
		LIMIT 1
	`;

	const rows = await queryRows(q, [tokenHash, type]);
	return rows[0] || null;
}

/**
 * Mark an auth token as used.
 *
 * Responsibilities:
 * - mark the token as used
 * - update the used_at timestamp
 *
 * Notes:
 * - will not update already-used tokens
 * - safe to call after successful flows
 *
 * @param {string} tokenHash
 * @param {string} type
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function markTokenUsed(tokenHash, type, userId) {
	const q = `
		UPDATE auth_tokens
		SET
			used_at = NOW()
		WHERE token_hash = $1
			AND type = $2
			AND used_at IS NULL
			AND user_id = $3;
	`;

	const result = await query(q, [tokenHash, type, userId]);

	return result.rowCount > 0;
}

export default {
	createToken,
	findTokenByHash,
	markTokenUsed,
};
