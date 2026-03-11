//! server.js

/**
 * Application Entry Point
 *
 * Starts the HTTP server using the configured Express application.
 */

import env from './config/dotenv.js';
import app from './config/express.js';
import logger from './config/logger.js';

app.listen(env.PORT, () => {
	logger.success(`Server running on ${env.CLIENT_URL}`, { type: 'server' });
});
