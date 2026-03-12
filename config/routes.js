//! config/routes.js

/**
 * Application Routes
 *
 * Central route registry for the application.
 * Routes can be expanded here directly for now,
 * then split into dedicated route modules as the project grows.
 */

import { Router } from 'express';

import { SUPPORTED_LANGUAGE_SET } from '../config/languages.js';

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
	const { lang } = req.params;

	if (SUPPORTED_LANGUAGE_SET.has(lang)) {
		res.cookie('lang', lang, {
			httpOnly: false,
			sameSite: 'lax',
			maxAge: 1000 * 60 * 60 * 24 * 30,
		});
	}

	res.redirect(req.get('Referrer') || '/');
});

export default router;
