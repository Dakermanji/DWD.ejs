//! controllers/home.js

/**
 * Home Controller
 *
 * Contains request handlers related to the homepage.
 */

/**
 * Render the homepage.
 *
 * Uses the home/main view.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
export function renderHome(req, res) {
	res.render('home/main', {
		titleKey: 'home:title',
		styles: [
			'home/main',
			'home/hero',
			'home/about',
			'home/services',
			'home/portfolio',
			'home/contact',
			'modals/main',
			'modals/auth-tabs',
			'partials/brands',
		],
		scripts: ['home/mouseTrailAndFollower', 'home/portfolio', 'home/auth'],
		verifyEmailToken: req.session.completeSignup || null,
	});
}
