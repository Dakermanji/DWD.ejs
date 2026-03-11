//! middlewares/session.js

/**
 * Session Middleware
 *
 * Configures session management for the application.
 * Sessions allow storing temporary data between requests,
 * such as authentication state, language preferences,
 * and flash messages.
 */

import session from 'express-session';
import env from '../config/dotenv.js';

/**
 * Registers the session middleware.
 *
 * @param {import('express').Express} app - Express application instance
 */
export default function configureSession(app) {
	app.use(
		session({
			// Secret used to sign the session ID cookie
			secret: env.SESSION_SECRET,

			// Do not save session if it was never modified
			resave: false,

			// Do not create empty sessions
			saveUninitialized: false,

			cookie: {
				// Prevent client-side JavaScript from accessing the cookie
				httpOnly: true,

				// Only transmit cookie over HTTPS in production
				secure: env.NODE_ENV === 'production',

				// Cookie lifespan (1 day)
				maxAge: 1000 * 60 * 60 * 24,
			},
		}),
	);
}
