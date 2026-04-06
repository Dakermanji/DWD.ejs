//! controllers/auth/recovery.js

import logger from '../../config/logger.js';
import { handleRecoveryRequest } from '../../services/auth/recovery.js';
import { getRequestMeta } from '../../services/http/requestMeta.js';

/**
 * Handle account recovery actions.
 *
 * Supported intents:
 * - password_reset
 * - resend_verification
 *
 * Expected input:
 * - req.body.email   (already validated + normalized)
 * - req.body.intent  (already validated)
 *
 * Notes:
 * - always returns the same success response on normal flow
 * - does not reveal whether the email exists
 * - resend verification only applies to existing unverified users
 * - reset password should only apply to existing verified users
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<import('express').Response>}
 */
export async function recovery(req, res) {
	const { email, intent } = req.body;
	const locale = req.locale || 'en';
	const requestMeta = getRequestMeta(req);

	try {
		await handleRecoveryRequest({ requestMeta, email, intent, locale });

		req.flash('success', 'auth:recovery.check_your_email');
		return res.redirect('/');
	} catch (error) {
		logger.error('recovery error', {
			error: error.message,
		});

		req.flash('error', 'common:error.generic');
		req.flash('modal', 'recovery');
		return res.redirect('/');
	}
}

export default recovery;
