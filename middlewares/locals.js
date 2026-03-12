//! middlewares/locals.js;

/**
 * Locals Middleware
 * Exposes commonly used variables to all views.
 */

export default function configureLocals(app) {
	app.use((req, res, next) => {
		// flash
		res.locals.success = req.flash('success');
		res.locals.error = req.flash('error');
		res.locals.warning = req.flash('warning');
		res.locals.info = req.flash('info');

		// empty and define styles and scripts
		res.locals.styles = [];
		res.locals.scripts = [];

		// user
		res.locals.user = null;
		next();
	});
}
