//! models/AuthSecurity.js

/**
 * Auth Security Model
 * -------------------
 * Handles auth_security table operations.
 *
 * Notes:
 * - userId is preferred when available
 * - identifier can be used before a user is known
 * - behavior is intentionally minimal for now
 */

/**
 * Find auth security row by user id or identifier.
 *
 * @param {{
 *   userId?: string | null,
 *   identifier?: string | null
 * }} params
 * @returns {Promise<object|null>}
 */
async function findByUserIdOrIdentifier({ userId = null, identifier = null }) {
	void userId;
	void identifier;

	return null;
}

/**
 * Create an auth security row if needed.
 *
 * @param {{
 *   userId?: string | null,
 *   identifier?: string | null
 * }} params
 * @returns {Promise<void>}
 */
async function createIfMissing({ userId = null, identifier = null }) {
	void userId;
	void identifier;
}

/**
 * Record a failed sign-in attempt.
 *
 * @param {{
 *   userId?: string | null,
 *   identifier?: string | null
 * }} params
 * @returns {Promise<void>}
 */
async function recordFailedSignin({ userId = null, identifier = null }) {
	void userId;
	void identifier;
}

/**
 * Record a successful sign-in.
 *
 * @param {{
 *   userId?: string | null,
 *   identifier?: string | null
 * }} params
 * @returns {Promise<void>}
 */
async function recordSuccessfulSignin({ userId = null, identifier = null }) {
	void userId;
	void identifier;
}

async function setLockedUntil({
	userId = null,
	identifier = null,
	lockedUntil,
}) {}

export default {
	findByUserIdOrIdentifier,
	createIfMissing,
	recordFailedSignin,
	recordSuccessfulSignin,
	setLockedUntil,
};
