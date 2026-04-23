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

/**
 * Create one follow relationship.
 *
 * @param {string} followerId
 * @param {string} followeeId
 * @returns {Promise<boolean>}
 */
export async function create(followerId, followeeId) {
	const q = `
		INSERT INTO user_follows (follower_id, followee_id)
		VALUES ($1, $2)
		ON CONFLICT (follower_id, followee_id) DO NOTHING;
	`;

	const result = await query(q, [followerId, followeeId]);
	return result.rowCount > 0;
}

/**
 * Remove follow relationships in both directions between two users.
 *
 * @param {string} userAId
 * @param {string} userBId
 * @returns {Promise<boolean>}
 */
export async function removeBothDirections(userAId, userBId) {
	const q = `
		DELETE FROM user_follows
		WHERE (follower_id = $1 AND followee_id = $2)
			OR (follower_id = $2 AND followee_id = $1);
	`;

	const result = await query(q, [userAId, userBId]);
	return result.rowCount > 0;
}

/**
 * Remove one follow relationship.
 *
 * @param {string} followerId
 * @param {string} followeeId
 * @returns {Promise<boolean>}
 */
export async function removeOneDirection(followerId, followeeId) {
	const q = `
		DELETE FROM user_follows
		WHERE follower_id = $1
			AND followee_id = $2;
	`;

	const result = await query(q, [followerId, followeeId]);
	return result.rowCount > 0;
}

export default {
	exists,
	create,
	removeBothDirections,
	removeOneDirection,
};
