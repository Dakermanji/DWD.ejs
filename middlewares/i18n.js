//! middlewares/i18n.js

/**
 * i18next Express middleware integration.
 *
 * This middleware:
 * 1. Attaches i18next to the Express request lifecycle.
 * 2. Exposes translation helpers to all EJS views.
 *
 * After this middleware runs:
 *   - req.t(key) becomes available in routes
 *   - t(key) becomes available inside EJS templates
 *   - currentLang is available for UI logic (language switcher, html lang attr, etc.)
 */

import { i18next, i18nextMiddleware } from '../config/i18n.js';

const i18nextMiddlewares = (app) => {
	/**
	 * Attach i18next middleware to Express.
	 * Must be placed:
	 *   after session middleware
	 *   before application routes
	 */
	app.use(i18nextMiddleware.handle(i18next));

	/**
	 * Expose translation utilities to EJS views.
	 *
	 * res.locals.t → translation function
	 * res.locals.currentLang → currently resolved language
	 */
	app.use((req, res, next) => {
		res.locals.t = req.t;
		res.locals.currentLang = req.language || req.resolvedLanguage || 'en';
		next();
	});
};

export default i18nextMiddlewares;
