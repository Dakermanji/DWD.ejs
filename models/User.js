//! models/User.js

import { query, queryRows } from '../config/database.js';

/**
 * Find a user by email (basic fields only).
 *
 * Used in auth flows where full user data is not required.
 *
 * @param {string} email
 * @returns {Promise<{ id: string, email: string, is_verified: boolean } | null>}
 */
async function findByEmailBasic(email) {
	const q = `
		SELECT id, email, is_verified
		FROM users
		WHERE email = $1
		LIMIT 1
	`;

	const rows = await queryRows(q, [email]);
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
async function createLocalPendingUser(email, locale) {
	const q = `
		INSERT INTO users (email, locale)
		VALUES ($1, $2)
		RETURNING id, email, locale, is_verified, created_at
	`;

	const rows = await queryRows(q, [email, locale]);
	return rows[0] || null;
}

/**
 * Update the verified state of a user by id.
 *
 * @param {string} userId
 * @param {boolean} isVerified
 * @returns {Promise<boolean>}
 */
async function updateIsVerifiedById(userId, isVerified) {
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
async function usernameExists(username) {
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
async function completeLocalSignupById(userId, username, hashedPassword) {
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

/**
 * Find completed local user for sign-in.
 *
 * Requirements:
 * - matched by email or username
 * - local signup must be completed
 *
 * @param {string} identifier
 * - expected to be normalized (lowercase) by validator
 * @param {'email' | 'username'} identifierType
 * @returns {Promise<object|null>}
 */
async function findForLocalSignin(identifier, identifierType) {
	const lookupColumn =
		identifierType === 'email'
			? 'email'
			: identifierType === 'username'
				? 'username_normalized'
				: null;

	if (!lookupColumn) {
		throw new Error(`Unsupported identifier type: ${identifierType}`);
	}

	const q = `
		SELECT id, email, username, hashed_password, is_blocked
		FROM users
		WHERE ${lookupColumn} = $1
			AND username IS NOT NULL
			AND hashed_password IS NOT NULL
		LIMIT 1;
	`;

	const rows = await queryRows(q, [identifier]);

	return rows[0] ?? null;
}

/**
 * Find user with fields needed for recovery.
 *
 * Requirements:
 * - matched by normalized email
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findUserForRecovery(email) {
	const q = `
		SELECT
			id,
			email,
			is_verified,
			is_blocked,
			(hashed_password IS NOT NULL) AS has_password
		FROM users
		WHERE email = $1
		LIMIT 1;
	`;

	const rows = await queryRows(q, [email]);
	return rows[0] ?? null;
}

/**
 * Update a user's password hash by id.
 *
 * Responsibilities:
 * - replace the stored hashed password
 * - refresh the updated_at timestamp
 *
 * Notes:
 * - expects hashedPassword to already be hashed
 * - does not validate password strength
 *
 * @param {string} userId
 * @param {string} hashedPassword
 * @returns {Promise<{ id: string, email: string } | null>}
 */
async function updatePasswordById(userId, hashedPassword) {
	const q = `
		UPDATE users
		SET hashed_password = $1, updated_at = NOW()
		WHERE id = $2
		RETURNING id, email;
	`;

	const rows = await queryRows(q, [hashedPassword, userId]);
	return rows[0] || null;
}

/**
 * Find a user by id for Passport session restore.
 *
 * Responsibilities:
 * - load only the fields needed on req.user
 * - avoid returning sensitive fields like hashed_password
 *
 * @param {string} userId
 * @returns {Promise<{
 *   id: string,
 *   email: string,
 *   username: string | null,
 *   is_verified: boolean,
 *   is_blocked: boolean
 * } | null>}
 */
async function findByIdForSession(userId) {
	const q = `
    SELECT
		id,
		email,
		username,
		is_verified,
		is_blocked
    FROM users
    WHERE id = $1
    LIMIT 1;
	`;

	const rows = await queryRows(q, [userId]);
	return rows[0] || null;
}

/**
 * Create a user from OAuth.
 *
 * @param {string} email
 * @param {string} locale
 * @param {boolean} isVerified
 * @returns {Promise<{
 *   id: string,
 *   email: string,
 *   username: string | null,
 *   is_verified: boolean,
 *   is_blocked: boolean,
 *   locale: string
 * } | null>}
 */
async function createOAuthUser(email, locale = 'en', isVerified = true) {
	const q = `
		INSERT INTO users (
			email,
			locale,
			is_verified
		)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			email,
			username,
			is_verified,
			is_blocked,
			locale;
	`;

	const rows = await queryRows(q, [email, locale, isVerified]);
	return rows[0] ?? null;
}

export default {
	findByEmailBasic,
	createLocalPendingUser,
	updateIsVerifiedById,
	usernameExists,
	completeLocalSignupById,
	findForLocalSignin,
	findUserForRecovery,
	updatePasswordById,
	findByIdForSession,
	createOAuthUser,
};
