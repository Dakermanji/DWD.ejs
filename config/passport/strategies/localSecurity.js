//! config/passport/strategies/localSecurity.js

/**
 * Local sign-in security helpers.
 *
 * Keeps Passport strategy readable.
 * DB-backed logic can later move into models.
 */

/**
 * Extract request metadata for auth logging/security tracking.
 *
 * @param {import('express').Request} req
 * @returns {{
 *   ipAddress: string | null,
 *   userAgent: string | null,
 *   identifier: string | null
 * }}
 */
function getRequestMeta(req) {
	return {
		ipAddress: req.ip || null,
		userAgent: req.get('user-agent') || null,
		identifier: req.body.identifier || null,
	};
}

/**
 * Log an auth security event.
 *
 * Temporary stub:
 * - later should insert into auth_security_events
 *
 * @param {{
 *   userId?: string | null,
 *   identifier?: string | null,
 *   eventType: string,
 *   ipAddress?: string | null,
 *   userAgent?: string | null
 * }} params
 * @returns {Promise<void>}
 */
async function logAuthEvent({
	userId = null,
	identifier = null,
	eventType,
	ipAddress = null,
	userAgent = null,
}) {
	void userId;
	void identifier;
	void eventType;
	void ipAddress;
	void userAgent;
}

/**
 * Get auth security state for a sign-in attempt.
 *
 * Temporary stub:
 * - later should read from auth_security
 *
 * @param {{
 *   userId?: string | null,
 *   identifier?: string | null
 * }} params
 * @returns {Promise<{
 *   failed_signin_count?: number,
 *   locked_until?: Date | string | null,
 *   force_password_reset?: boolean
 * } | null>}
 */
async function getAuthSecurityState({ userId = null, identifier = null }) {
	void userId;
	void identifier;

	return null;
}

/**
 * Update auth security state after sign-in attempt.
 *
 * Temporary stub:
 * - on failure: increment failed count / update last_failed_signin_at
 * - on success: reset failures / clear lock / update last_signin_at
 *
 * @param {{
 *   successful: boolean,
 *   userId?: string | null,
 *   identifier?: string | null
 * }} params
 * @returns {Promise<void>}
 */
async function updateSigninState({
	successful,
	userId = null,
	identifier = null,
}) {
	void successful;
	void userId;
	void identifier;
}

/**
 * Check whether auth security state is locked.
 *
 * @param {{ locked_until?: Date | string | null } | null} authSecurity
 * @returns {boolean}
 */
function isLocked(authSecurity) {
	if (!authSecurity?.locked_until) {
		return false;
	}

	return new Date(authSecurity.locked_until).getTime() > Date.now();
}

export {
	getRequestMeta,
	logAuthEvent,
	getAuthSecurityState,
	updateSigninState,
	isLocked,
};

export default {
	getRequestMeta,
	logAuthEvent,
	getAuthSecurityState,
	updateSigninState,
	isLocked,
};
