//! middlewares/flash.js

/**
 * Flash Message Middleware
 *
 * Enables temporary messages stored in the session.
 * Flash messages persist for a single request and are
 * commonly used for notifications such as success,
 * error, or warning messages after redirects.
 */

import flash from 'connect-flash';

/**
 * Registers flash message support.
 *
 * @param {import('express').Express} app - Express application instance
 */
export default function configureFlash(app) {
	app.use(flash());
}
