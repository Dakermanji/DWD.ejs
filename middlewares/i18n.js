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
import { SUPPORTED_LANGUAGES } from '../config/languages.js';
import { getLocale } from '../services/i18n/locale.js';

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
	app.use(async (req, res, next) => {
		try {
			const currentLang = getLocale(req);

			if (req.i18n && req.language !== currentLang) {
				await req.i18n.changeLanguage(currentLang);
			}

			res.locals.t = req.t;
			res.locals.currentLang = currentLang;
			res.locals.languages = SUPPORTED_LANGUAGES;
			next();
		} catch (error) {
			next(error);
		}
	});
};

export default i18nextMiddlewares;
