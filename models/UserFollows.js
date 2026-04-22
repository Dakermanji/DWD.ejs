//! models/UserFollows.js

import { query } from '../config/database.js';

/**
 * Check whether one user already follows another.
 *
 * @param {string} followerId
 * @param {string} followeeId
 * @returns {Promise<boolean>}
 */
export async function exists(followerId, followeeId) {
	const q = `
		SELECT 1
		FROM user_follows
		WHERE follower_id = $1
			AND followee_id = $2
		LIMIT 1;
	`;

	const result = await query(q, [followerId, followeeId]);
	return result.rowCount > 0;
}

export default {
	exists,
};
