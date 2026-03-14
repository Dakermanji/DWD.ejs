/**
 * Not Found Middleware
 *
 * Handles requests that did not match any route.
 * Creates a 404 error and forwards it to the global error handler.
 *
 * Some browser and tooling probes (e.g. Chrome DevTools) request
 * special paths such as /.well-known/* or /robots.txt. These are
 * harmless and should not trigger the application's error flow
 * or pollute logs, so they are silently ignored with a 204 response.
 */

export default function notFound(req, res, next) {
	// Ignore common browser/tooling probe paths
	if (req.path.startsWith('/.well-known') || req.path === '/robots.txt') {
		return res.status(204).end();
	}

	// Create a standard 404 error for unmatched routes
	const error = new Error('Page not found');
	error.status = 404;

	// Forward the error to the global error handler
	next(error);
}
