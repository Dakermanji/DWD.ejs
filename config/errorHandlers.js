//! config/errorHandlers.js

/**
 * Global Error Handler Registry
 *
 * Registers application-wide error handling middleware.
 */

import * as Sentry from '@sentry/node';

import notFound from '../middlewares/notFound.js';
import errorHandler from '../middlewares/errorHandler.js';

export default function applyErrorHandlers(app) {
	// Convert unmatched routes into a 404 error
	app.use(notFound);

	// Let Sentry capture Express errors before the final renderer runs
	Sentry.setupExpressErrorHandler(app);

	// Render the application's final user-facing error response
	app.use(errorHandler);
}
