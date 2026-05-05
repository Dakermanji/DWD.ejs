//! models/user/profile.js

import { query, queryRows } from '../../config/database.js';

export async function usernameExists(username) {
	const lowerCasedUsername = username.toLowerCase();

	const q = `
		SELECT 1
		FROM users
		WHERE username_normalized = $1
		LIMIT 1;
	`;

	const result = await query(q, [lowerCasedUsername]);

	return result.rowCount > 0;
}

export async function updateAvatarById(userId, avatarSeed) {
	const q = `
		UPDATE users
		SET avatar_seed = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, avatar_seed;
	`;

	const rows = await queryRows(q, [avatarSeed, userId]);
	return rows[0] || null;
}

export async function updateUsernameById(userId, username) {
	const q = `
		UPDATE users
		SET username = $1, updated_at = NOW()
		WHERE id = $2;
	`;

	try {
		const result = await query(q, [username, userId]);

		return {
			success: result.rowCount > 0,
		};
	} catch (error) {
		if (error.code === '23505') {
			return {
				success: false,
				reason: 'auth:error.username_taken',
			};
		}

		throw error;
	}
}

export async function findByUsername(username) {
	const q = `
		SELECT id, username, email
		FROM users
		WHERE username = $1
		LIMIT 1;
	`;

	const result = await query(q, [username]);
	return result.rows[0] || null;
}
