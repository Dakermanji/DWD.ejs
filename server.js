//! server.js

/**
 * Application Entry Point
 *
 * This file initializes and starts the Express server.
 * It acts as the main bootstrap for the application.
 *
 * Responsibilities:
 * - Load configuration
 * - Initialize Express
 * - Define base route (temporary)
 * - Start the HTTP server
 */

import express from 'express';

// Import centralized environment configuration
import env from './config/dotenv.js';

const app = express();

/**
 * Root Route
 *
 * Basic route used to verify that the server
 * is running correctly.
 */
app.get('/', (req, res) => {
	res.send('DWD.ejs server running');
});

/**
 * Start HTTP Server
 *
 * The server listens on the configured port
 * defined in the environment configuration.
 */
app.listen(env.PORT, () => {
	console.log(`Server running on ${env.CLIENT_URL}`);
});
