//! models/UserSocialNotifications.js

import { queryRows } from '../config/database.js';

/**
 * Create a social notification.
 *
 * @param {{
 *   recipientId: string,
 *   actorId: string,
 *   type: string,
 *   followRequestId?: string
 * }} params
 * @returns {Promise<object|null>}
 */
export async function create({
	recipientId,
	actorId,
	type,
	followRequestId = null,
}) {
	const q = `
		INSERT INTO user_social_notifications (
			recipient_id,
			actor_id,
			type,
			follow_request_id
		)
		VALUES ($1, $2, $3, $4)
		RETURNING id, recipient_id, actor_id, type, follow_request_id, created_at;
	`;

	const rows = await queryRows(q, [
		recipientId,
		actorId,
		type,
		followRequestId,
	]);

	return rows[0] || null;
}

export default {
	create,
};
