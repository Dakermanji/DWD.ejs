//! utils/auth/tokens.js

import crypto from 'node:crypto';

export const AUTH_EXPIRY_TIME = 1000 * 60 * 60; // unit is ms, result is 1 hour

/**
 * Create a secure random token for auth flows.
 *
 * Returned value is the raw token that can be sent to the user.
 *
 * @param {number} size
 * @returns {string}
 */
export function createAuthToken(size = 32) {
	return crypto.randomBytes(size).toString('hex');
}

/**
 * Hash an auth token before storing it in the database.
 *
 * @param {string} token
 * @returns {string}
 */
export function hashAuthToken(token) {
	return crypto.createHash('sha256').update(token).digest('hex');
}

export default {
	createAuthToken,
	hashAuthToken,
};
