//! controllers/dashboard.js

import { buildAccountOverview } from '../services/dashboard/account.js';

/**
 * Render the account dashboard shell.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
export function renderDashboard(req, res) {
	res.render('dashboard/main', {
		titleKey: 'layout:nav.dashboard',
		account: buildAccountOverview(req),
	});
}
