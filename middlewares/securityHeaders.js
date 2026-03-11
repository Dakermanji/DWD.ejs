//! middlewares/securityHeaders.js

/**
 * Security Headers Middleware
 *
 * Applies HTTP security headers using Helmet.
 * Helmet helps protect the application against common
 * web vulnerabilities by setting secure HTTP headers.
 *
 * Examples of protections:
 * - Clickjacking protection
 * - MIME sniffing prevention
 * - DNS prefetch control
 * - XSS protection headers
 * - Content Security Policy (optional)
 */

import helmet from 'helmet';

export default function securityHeaders(app) {
	app.use(
		helmet({
			contentSecurityPolicy: false, // Will configure later when frontend assets are defined
			crossOriginEmbedderPolicy: false,
		}),
	);
}
