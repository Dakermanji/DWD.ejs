//! middlewares/locals.js

import env from '../config/dotenv.js';

/**
 * Locals Middleware
 *
 * Exposes shared non-i18n view locals to all templates.
 *
 * Notes:
 * - `styles` and `scripts` are page-level asset arrays consumed by the layout.
 * - `user` is currently a temporary placeholder for navbar/auth UI testing.
 * - `currentRoute` is used to mark active navigation items.
 * - `currentRoute` is used for redirects and return to.
 */

export default function configureLocals(app) {
	app.use((req, res, next) => {
		// Dynamic page assets
		res.locals.styles = [];
		res.locals.scripts = [];

		// Temporary authenticated user placeholder
		res.locals.user = true;

		// Current route path for active navbar state
		res.locals.currentRoute = req.path;

		// Full URL including query params
		res.locals.currentUrl = req.originalUrl;

		// Passing email for consistency
		res.locals.email = env.EMAIL;

		next();
	});
}
