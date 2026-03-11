//! server.js

/**
 * Application Entry Point
 *
 * Registers global process error handlers
 * and starts the HTTP server using the configured Express application.
 */

import env from './config/dotenv.js';
import registerProcessHandlers from './config/process.js';
import app from './config/express.js';
import logger from './config/logger.js';

// Start HTTP server
const server = app.listen(env.PORT, () => {
	logger.success(`Server running on ${env.CLIENT_URL}`, { type: 'server' });
});

// Register global process error handlers
registerProcessHandlers(server);
