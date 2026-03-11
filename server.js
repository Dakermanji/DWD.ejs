//! server.js

/**
 * Application Entry Point
 *
 * Starts the HTTP server using the configured Express application.
 */

import env from './config/dotenv.js';
import app from './config/express.js';

app.listen(env.PORT, () => {
	console.log(`Server running on ${env.CLIENT_URL}`);
});
