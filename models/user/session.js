//! models/user/session.js

import { queryRows } from '../../config/database.js';

export async function findByIdForSession(userId) {
	const q = `
    SELECT
		u.id,
		u.email,
		u.username,
		u.is_verified,
		u.is_blocked,
		(u.hashed_password IS NOT NULL) AS has_password,
		u.locale,
		u.country_code,
		u.theme,
		u.avatar_seed,
		COALESCE(
			array_agg(up.provider::text) FILTER (WHERE up.provider IS NOT NULL),
			'{}'
		) AS providers
    FROM users u
	LEFT JOIN user_providers up
		ON up.user_id = u.id
    WHERE u.id = $1
	GROUP BY u.id
    LIMIT 1;
	`;

	const rows = await queryRows(q, [userId]);
	return rows[0] || null;
}
