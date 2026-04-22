//! models/UserFollowRequests.js

import { queryRows } from '../config/database.js';

/**
 * Find a pending follow request between two users.
 *
 * @param {string} requesterId
 * @param {string} targetId
 * @returns {Promise<object|null>}
 */
export async function findPending(requesterId, targetId) {
	const q = `
		SELECT id, requester_id, target_id, status, created_at
		FROM user_follow_requests
		WHERE requester_id = $1
			AND target_id = $2
			AND status = 'pending'
		LIMIT 1;
	`;

	const rows = await queryRows(q, [requesterId, targetId]);
	return rows[0] || null;
}

/**
 * Create a pending follow request.
 *
 * @param {{ requesterId: string, targetId: string }} params
 * @returns {Promise<object|null>}
 */
export async function create({ requesterId, targetId }) {
	const q = `
		INSERT INTO user_follow_requests (requester_id, target_id)
		VALUES ($1, $2)
		RETURNING id, requester_id, target_id, status, created_at;
	`;

	const rows = await queryRows(q, [requesterId, targetId]);
	return rows[0] || null;
}

export default {
	findPending,
	create,
};
