//! config/middlewares.js

/**
 * Global Middleware Registry
 *
 * Applies all application-level middlewares in the correct order.
 * Keep this file as the central place for middleware composition.
 */

import securityHeaders from '../middlewares/securityHeaders.js';

export default function applyMiddlewares(app) {
	// Security headers
	securityHeaders(app);
}
