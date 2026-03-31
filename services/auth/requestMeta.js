//! services/auth/requestMeta.js

/**
 * Extract request metadata for auth/security logging.
 *
 * Responsibilities:
 * - normalize access to request metadata
 * - keep controllers and strategies clean
 *
 * Notes:
 * - safe fallback to null values
 *
 * @param {import('express').Request} req
 * @returns {{
 *   ipAddress: string | null,
 *   userAgent: string | null,
 *   identifier?: string | null
 * }}
 */
export function getRequestMeta(req) {
	return {
		ipAddress: req.ip || null,
		userAgent: req.get('user-agent') || null,
		identifier: req.body?.identifier || null,
	};
}
