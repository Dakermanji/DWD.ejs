//! config/routes.js

/**
 * Application Routes
 *
 * Central route registry for the application.
 * Routes can be expanded here directly for now,
 * then split into dedicated route modules as the project grows.
 */

import { Router } from 'express';

const router = Router();

/**
 * Home Route
 *
 * Basic route used to verify that the server
 * is running correctly.
 */
router.get('/', (req, res) => {
	res.render('home', {
		title: 'Home',
	});
});

// Temporary Language switcher
router.get('/language/:lang', (req, res) => {
	const supportedLanguages = ['en', 'fr', 'ar'];
	const { lang } = req.params;

	if (supportedLanguages.includes(lang)) {
		res.cookie('lang', lang, {
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 1000 * 60 * 60 * 24 * 30,
		});
	}

	res.redirect(req.get('Referrer') || '/');
});

export default router;
