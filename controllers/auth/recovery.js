//! controllers/auth/recovery.js

import logger from '../../config/logger.js';
import UserModel from '../../models/User.js';
import {
	createPasswordResetAndSendEmail,
	createVerificationResendAndSendEmail,
} from '../../services/auth/recovery.js';

const RECOVERY_SUCCESS_KEY = 'auth:recovery.check_your_email';

/**
 * Return the same success message for normal recovery outcomes.
 *
 * This keeps the flow neutral and avoids revealing whether
 * an email exists or which recovery branch actually ran.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {import('express').Response}
 */
function respondRecoverySuccess(req, res) {
	req.flash('success', RECOVERY_SUCCESS_KEY);
	return res.redirect('/');
}

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

	try {
		const user = await UserModel.findByEmailBasic(email);

		if (!user) {
			return respondRecoverySuccess(req, res);
		}

		if (intent === 'resend_verification') {
			if (!user.is_verified) {
				await createVerificationResendAndSendEmail({
					userId: user.id,
					email: user.email,
					locale,
				});
			}

			return respondRecoverySuccess(req, res);
		}

		if (intent === 'password_reset') {
			if (user.is_verified) {
				await createPasswordResetAndSendEmail({
					userId: user.id,
					email: user.email,
					locale,
				});
			}

			return respondRecoverySuccess(req, res);
		}

		req.flash('error', 'auth:error.invalid_request');
		req.flash('modal', 'recovery');
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
