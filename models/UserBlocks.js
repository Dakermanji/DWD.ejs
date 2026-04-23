//! models/UserBlocks.js

import { query } from '../config/database.js';

/**
 * Check whether one user has blocked another.
 *
 * @param {string} blockerId
 * @param {string} blockedId
 * @returns {Promise<boolean>}
 */
export async function exists(blockerId, blockedId) {
	const q = `
		SELECT 1
		FROM user_blocks
		WHERE blocker_id = $1
			AND blocked_id = $2
		LIMIT 1;
	`;

	const result = await query(q, [blockerId, blockedId]);
	return result.rowCount > 0;
}

/**
 * Create one block relationship.
 *
 * @param {string} blockerId
 * @param {string} blockedId
 * @returns {Promise<boolean>}
 */
export async function create(blockerId, blockedId) {
	const q = `
		INSERT INTO user_blocks (blocker_id, blocked_id)
		VALUES ($1, $2)
		ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
	`;

	const result = await query(q, [blockerId, blockedId]);
	return result.rowCount > 0;
}

/**
 * Remove one block relationship.
 *
 * @param {string} blockerId
 * @param {string} blockedId
 * @returns {Promise<boolean>}
 */
export async function remove(blockerId, blockedId) {
	const q = `
		DELETE FROM user_blocks
		WHERE blocker_id = $1
			AND blocked_id = $2;
	`;

	const result = await query(q, [blockerId, blockedId]);
	return result.rowCount > 0;
}

export default {
	exists,
	create,
	remove,
};
