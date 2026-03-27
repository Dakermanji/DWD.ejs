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
	return rows[0] || null;
}

/**
 * Create a local pending user.
 *
 * Used during the first local signup step before
 * password and username are completed.
 *
 * @param {string} email
 * @param {string} emailNormalized
 * @returns {Promise<{ id: string, email: string, locale: string, is_verified: boolean, created_at: Date } | null>}
 */
export async function createLocalPendingUser(email, emailNormalized, locale) {
	const q = `
		INSERT INTO users (email, email_normalized, locale)
		VALUES ($1, $2, $3)
		RETURNING id, email, locale, is_verified, created_at
	`;

	const rows = await queryRows(q, [email, emailNormalized, locale]);
	return rows[0] || null;
}

/**
 * Update the verified state of a user by id.
 *
 * @param {string} userId
 * @param {boolean} isVerified
 * @returns {Promise<boolean>}
 */
export async function updateIsVerifiedById(userId, isVerified) {
	const q = `
		UPDATE users
		SET
			is_verified = $1,
			updated_at = NOW()
		WHERE id = $2
		RETURNING id;
	`;

	const rows = await queryRows(q, [isVerified, userId]);
	return rows.length > 0;
}

/**
 * Check whether a username already exists.
 *
 * Notes:
 * - expects a normalized username
 * - uses a lightweight existence query
 *
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export async function usernameExists(username) {
	const lowerCasedUsername = username.toLowerCase();

	const result = await db.query(
		`SELECT 1 FROM users WHERE username_normalized = $1 LIMIT 1`,
		[lowerCasedUsername],
	);

	return result.rowCount > 0;
}

export default {
	findByEmailBasic,
	createLocalPendingUser,
	updateIsVerifiedById,
};
