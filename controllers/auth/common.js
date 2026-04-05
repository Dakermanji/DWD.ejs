//! controllers\auth\common.js

import AuthSecurityEventModel from '../../models/AuthSecurityEvent.js';

/**
 * Log auth event.
 *
 * @param {{
 *   userId?: string | null,
 *   email: string,
 *   eventType: string,
 *   requestMeta: {
 *     ipAddress: string | null,
 *     userAgent: string | null
 *   }
 * }} params
 * @returns {Promise<void>}
 */
export async function logAuthEvent({
	userId = null,
	email,
	eventType,
	requestMeta,
}) {
	await AuthSecurityEventModel.insertAuthEvent({
		userId,
		identifier: email,
		eventType,
		ipAddress: requestMeta.ipAddress,
		userAgent: requestMeta.userAgent,
	});
}
