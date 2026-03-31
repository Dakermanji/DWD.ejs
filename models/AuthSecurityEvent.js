//! models/AuthSecurityEvent.js

import { query } from '../config/database.js';

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
 * Responsibilities:
 * - persist one auth event row
 * - store request metadata when available
 *
 * Notes:
 * - userId is optional for pre-user failures
 * - identifier can be email or username
 * - ipAddress uses PostgreSQL INET column
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
	const q = `
		INSERT INTO auth_security_events (
			user_id,
			identifier,
			ip_address,
			event_type,
			user_agent
		)
		VALUES ($1, $2, $3, $4, $5);
	`;

	await query(q, [userId, identifier, ipAddress, eventType, userAgent]);
}

export default {
	insertAuthEvent,
};
