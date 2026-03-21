//! middlewares/passport.js

/**
 * Passport Middleware
 *
 * Responsibilities:
 * - Initialize Passport for every request
 * - Restore authenticated users from the session
 *
 * Why this file exists:
 * - Keeps Passport middleware wiring out of app bootstrap
 * - Keeps middleware composition clean and modular
 *
 * Notes:
 * - Requires session middleware to run first
 * - Uses the shared Passport setup from config/passport/index.js
 */

import setupPassport from '../config/passport/index.js';

const passport = setupPassport();

/**
 * Registers Passport middlewares.
 *
 * @param {import('express').Express} app - Express application instance
 */
export default function configurePassport(app) {
	app.use(passport.initialize());
	app.use(passport.session());
}

export { passport };
