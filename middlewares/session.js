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
			//Session name: default connect.sid
			name: 'DWD.sid',

			// Secret used to sign the session ID cookie
			secret: env.SESSION_SECRET,

			// Do not save session if it was never modified
			resave: false,

			// Do not create empty sessions
			saveUninitialized: false,

			// Refreshes the session expiration on activity: active users keep their session alive
			rolling: true,

			cookie: {
				// Prevent client-side JavaScript from accessing the cookie
				httpOnly: true,

				// Only transmit cookie over HTTPS in production
				secure: env.NODE_ENV === 'production',

				// Helps protect against CSRF by restricting cross-site cookie usage
				sameSite: 'lax',

				// Cookie lifespan (1 day)
				maxAge: 1000 * 60 * 60 * 24,
			},
		}),
	);
}
