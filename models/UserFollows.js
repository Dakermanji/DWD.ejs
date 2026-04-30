//! models/UserFollows.js

import { query, queryRows } from '../config/database.js';

const BASE_FIELDS = ['id', 'follower_id', 'followee_id', 'created_at'];
const baseFieldsWithAlias = (alias) =>
	BASE_FIELDS.map((field) => `${alias}.${field}`).join(', ');

/**
 * Find users followed by one follower.
 *
 * @param {string} followerId
 * @returns {Promise<Array>}
 */
export async function findFolloweesByFollower(followerId) {
	const q = `
		SELECT
			${baseFieldsWithAlias('uf')},
			u.username AS followee_username,
			u.email AS followee_email,
			EXISTS (
				SELECT 1
				FROM user_follows mutual
				WHERE mutual.follower_id = uf.followee_id
					AND mutual.followee_id = uf.follower_id
			) AS is_mutual
		FROM user_follows uf
		INNER JOIN users u
			ON u.id = uf.followee_id
		WHERE uf.follower_id = $1
		ORDER BY uf.created_at DESC;
	`;

	return queryRows(q, [followerId]);
}

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
	findFolloweesByFollower,
	exists,
	create,
	removeBothDirections,
	removeOneDirection,
};
