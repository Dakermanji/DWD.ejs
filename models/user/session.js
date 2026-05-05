//! models/user/session.js

import { queryRows } from '../../config/database.js';

export async function findByIdForSession(userId) {
	const q = `
    SELECT
		id,
		email,
		username,
		is_verified,
		is_blocked,
		locale,
		country_code,
		theme,
		avatar_seed
    FROM users
    WHERE id = $1
    LIMIT 1;
	`;

	const rows = await queryRows(q, [userId]);
	return rows[0] || null;
}
