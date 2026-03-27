//! models/User.js

import { query, queryRows } from '../config/database.js';

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
		WHERE id = $2;
	`;

	const result = await query(q, [isVerified, userId]);

	return result.rowCount > 0;
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

	const q = `
		SELECT 1
		FROM users
		WHERE username_normalized = $1
		LIMIT 1;
	`;

	const result = await query(q, [lowerCasedUsername]);

	return result.rowCount > 0;
}

/**
 * Complete local signup by user id.
 *
 * Responsibilities:
 * - set the chosen username
 * - set the normalized username
 * - set the hashed password
 * - update the updated_at timestamp
 *
 * Notes:
 * - expects validated inputs
 * - expects hashedPassword to already be hashed
 *
 * @param {string} userId
 * @param {string} username
 * @param {string} hashedPassword
 * @returns {Promise<{ id: string, username: string, email: string, is_verified: boolean } | null>}
 */
export async function completeLocalSignupById(
	userId,
	username,
	hashedPassword,
) {
	const lowerCasedUsername = username.toLowerCase();

	const q = `
		UPDATE users
		SET
			username = $1,
			username_normalized = $2,
			hashed_password = $3,
			updated_at = NOW()
		WHERE id = $4
			AND username IS NULL
			AND hashed_password IS NULL
		RETURNING id, username, email, is_verified;
	`;

	const rows = await queryRows(q, [
		username,
		lowerCasedUsername,
		hashedPassword,
		userId,
	]);

	return rows[0] || null;
}

export default {
	findByEmailBasic,
	createLocalPendingUser,
	updateIsVerifiedById,
	usernameExists,
	completeLocalSignupById,
};
