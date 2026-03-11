//! config/middlewares.js

/**
 * Global Middleware Registry
 *
 * Applies all application-level middlewares in the correct order.
 * Keep this file as the central place for middleware composition.
 */

import securityHeaders from '../middlewares/securityHeaders.js';
import requestLogger from '../middlewares/requestLogger.js';
import parsers from '../middlewares/parsers.js';
import staticFiles from '../middlewares/staticFiles.js';

export default function applyMiddlewares(app) {
	// Apply security-related HTTP headers first
	securityHeaders(app);

	// Log all incoming HTTP requests
	requestLogger(app);

	// Parse incoming request bodies (JSON and URL-encoded form data)
	parsers(app);

	// Enable serving static files such as stylesheets, scripts, and images
	staticFiles(app);
}
