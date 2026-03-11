//! config/errorHandlers.js

/**
 * Global Error Handler Registry
 *
 * Registers application-wide error handling middleware.
 * This is separated to keep Express bootstrap logic clean and scalable.
 */

import notFound from '../middlewares/notFound.js';
import errorHandler from '../middlewares/errorHandler.js';

export default function applyErrorHandlers(app) {
	// Handle unknown routes
	app.use(notFound);

	// Handle application errors
	app.use(errorHandler);
}
