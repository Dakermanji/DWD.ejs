//! services/auth/password.js

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 *
 * Responsibilities:
 * - generate a salted hash using bcrypt
 * - return a secure hash ready for storage
 *
 * Notes:
 * - never store raw passwords
 * - hashing is intentionally slow to resist brute-force attacks
 *
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
	const value = String(password ?? '');
	return bcrypt.hash(value, SALT_ROUNDS);
}

/**
 * Compare a plain password with a stored hash.
 *
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export function comparePassword(password, hash) {
	return bcrypt.compare(String(password ?? ''), hash);
}
