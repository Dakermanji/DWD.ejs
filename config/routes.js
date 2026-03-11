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

export default router;
