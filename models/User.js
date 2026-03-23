//! models/User.js

import { queryRows } from '../config/database.js';

/**
 * Find a user by email (basic fields only).
 *
 * Used in auth flows where full user data is not required.
 *
 * @param {string} emailNormalized
 * @returns {Promise<{ id: string, email: string, is_verified: boolean } | null>}
 */
export async function findByEmailBasic(emailNormalized) {
	const q = `
		SELECT id, email, is_verified
		FROM users
		WHERE email_normalized = $1
		LIMIT 1
		`;
	const rows = await queryRows(q, [emailNormalized]);
	console.log(rows);

	return rows[0] || null;
}

export default { findByEmailBasic };
