//! models/User.js

import { query, queryRows } from '../config/database.js';

/**
 * Find a user by email (basic fields only).
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
 * @param {string} email
 * @param {string} locale
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
 * @param {string} userId
 * @param {string} username
 * @param {string} hashedPassword
 * @param {string | null} avatarSeed
 * @param {string | null} countryCode
 * @returns {Promise<{ id: string, username: string, email: string, is_verified: boolean } | null>}
 */
async function completeLocalSignupById(
	userId,
	username,
	hashedPassword,
	avatarSeed = null,
	countryCode = null,
) {
	const lowerCasedUsername = username.toLowerCase();

	const q = `
		UPDATE users
		SET
			username = $1,
			username_normalized = $2,
			hashed_password = $3,
			avatar_seed = $4,
			country_code = $5,
			updated_at = NOW()
		WHERE id = $6
			AND username IS NULL
			AND hashed_password IS NULL
		RETURNING
			id,
			username,
			email,
			is_verified,
			locale,
			country_code,
			theme,
			avatar_seed;
	`;

	const rows = await queryRows(q, [
		username,
		lowerCasedUsername,
		hashedPassword,
		avatarSeed,
		countryCode,
		userId,
	]);

	return rows[0] || null;
}

/**
 * Find completed local user for sign-in.
 *
 * @param {string} identifier
 * @param {'email' | 'username'} identifierType
 * @returns {Promise<object|null>}
 */
async function findForLocalSignin(identifier, identifierType) {
	const lookupColumnMap = {
		email: 'email',
		username: 'username_normalized',
	};
	const lookupColumn = lookupColumnMap[identifierType];

	if (!lookupColumn) {
		throw new Error(`Unsupported identifier type: ${identifierType}`);
	}

	const q = `
		SELECT
			id,
			email,
			username,
			hashed_password,
			is_blocked,
			locale,
			country_code,
			theme,
			avatar_seed
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
 * @param {string} userId
 * @returns {Promise<{
 *   id: string,
 *   email: string,
 *   username: string | null,
 *   is_verified: boolean,
 *   is_blocked: boolean,
 *   locale: string,
 *   country_code: string | null,
 *   theme: string,
 *   avatar_seed: string | null
 * } | null>}
 */
async function findByIdForSession(userId) {
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
 *   locale: string,
 *   country_code: string | null,
 *   theme: string,
 *   avatar_seed: string | null
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
			locale,
			country_code,
			theme,
			avatar_seed;
	`;

	const rows = await queryRows(q, [email, locale, isVerified]);
	return rows[0] ?? null;
}

/**
 * Update a user's locale preference.
 *
 * @param {number|string} userId
 * @param {string} locale
 * @returns {Promise<boolean>} Whether a row was updated
 */
export async function updateLocale(userId, locale) {
	const q = `
		UPDATE users
		SET locale = $1, updated_at = NOW()
		WHERE id = $2;
	`;

	const result = await query(q, [locale, userId]);
	return result.rowCount > 0;
}

/**
 * Update a user's theme preference.
 *
 * @param {number|string} userId
 * @param {'system'|'light'|'dark'} theme
 * @returns {Promise<boolean>} Whether a row was updated
 */
export async function updateTheme(userId, theme) {
	const q = `
		UPDATE users
		SET theme = $1, updated_at = NOW()
		WHERE id = $2;
	`;

	const result = await query(q, [theme, userId]);
	return result.rowCount > 0;
}

/**
 * Update a user's avatar seed by id.
 *
 * @param {number|string} userId
 * @param {string} avatarSeed
 * @returns {Promise<{ id: string, avatar_seed: string } | null>}
 */
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

/**
 * Update username for a specific user.
 *
 * Responsibilities:
 * - persist a new username for the given user ID
 * - handle duplicate username conflicts gracefully
 * - update the modification timestamp
 *
 * Notes:
 * - assumes username is already validated and normalized
 * - rethrows unexpected database errors
 *
 * @param {number} userId
 * @param {string} username
 * @returns {Promise<{
 *   success: boolean,
 *   reason?: 'auth:error.username_taken'
 * }>}
 */
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
		// handle duplicate username from unique constraint
		if (error.code === '23505') {
			return {
				success: false,
				reason: 'auth:error.username_taken',
			};
		}

		throw error;
	}
}

/**
 * Complete OAuth signup profile fields for a specific user.
 *
 * @param {number|string} userId
 * @param {string} username
 * @param {string | null} avatarSeed
 * @param {string | null} countryCode
 * @returns {Promise<{
 *   success: boolean,
 *   user?: object,
 *   reason?: 'auth:error.username_taken'
 * }>}
 */
export async function completeOAuthSignupById(
	userId,
	username,
	avatarSeed = null,
	countryCode = null,
) {
	const lowerCasedUsername = username.toLowerCase();

	const q = `
		UPDATE users
		SET
			username = $1,
			username_normalized = $2,
			avatar_seed = $3,
			country_code = $4,
			updated_at = NOW()
		WHERE id = $5
			AND username IS NULL
		RETURNING
			id,
			username,
			email,
			is_verified,
			is_blocked,
			locale,
			country_code,
			theme,
			avatar_seed;
	`;

	try {
		const rows = await queryRows(q, [
			username,
			lowerCasedUsername,
			avatarSeed,
			countryCode,
			userId,
		]);

		return {
			success: rows.length > 0,
			user: rows[0],
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

/**
 * Update last sign in for a specific user.
 *
 * @param {number} userId
 * @returns {Promise<boolean>} true if user was updated, false otherwise
 */

export async function updateLastSignIn(userId) {
	const q = `
		UPDATE users
		SET last_signin_at = NOW(), updated_at = NOW()
		WHERE id = $1;
	`;

	const result = await query(q, [userId]);
	return result.rowCount > 0;
}

/**
 * Find a user by username.
 *
 * @param {string} username
 * @returns {Promise<object|null>} user record or null if not found
 */
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
	updateLocale,
	updateTheme,
	updateAvatarById,
	updateUsernameById,
	completeOAuthSignupById,
	updateLastSignIn,
	findByUsername,
};
