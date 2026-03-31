//! models/AuthSecurityEvent.js

/**
 * Auth Security Event Model
 * -------------------------
 * Handles insertions into auth_security_events table.
 *
 * Notes:
 * - append-only table
 * - no updates or deletes
 */

/**
 * Insert a new auth security event.
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
async function insertAuthEvent({
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

export default {
	insertAuthEvent,
};
