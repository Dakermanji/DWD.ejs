//! services/auth/recovery.js

import { isRecoveryRateLimited } from './security';
import UserModel from '../../models/User.js';
import { logAuthEvent } from '../../config/passport/strategies/localSecurity';

export async function createPasswordResetAndSendEmail() {
	return;
}

export async function createVerificationResendAndSendEmail() {
	return;
}

/**
 * Check whether a user is eligible for a recovery intent.
 *
 * @param {Object} params
 * @param {Object | null} params.user
 * @param {'password_reset' | 'resend_verification'} params.intent
 * @returns {boolean}
 */
export function isEligibleForRecoveryIntent({ user, intent }) {
	if (!user || user.is_blocked) {
		return false;
	}

	switch (intent) {
		case 'password_reset':
			return Boolean(user.is_verified && user.has_password);

		case 'resend_verification':
			return !user.is_verified;

		default:
			return false;
	}
}

/**
 * Handle a recovery request without revealing whether the email exists.
 *
 * @param {Object} params
 * @param {{ ip?: string, userAgent?: string }} params.requestMeta
 * @param {string} params.email
 * @param {'password_reset' | 'resend_verification'} params.intent
 * @param {string} params.locale
 * @returns {Promise<{ ok: true }>}
 */
export async function handleRecoveryRequest({
	requestMeta,
	email,
	intent,
	locale = 'en',
}) {
	// 1. check rate limit
	const limited = await isRecoveryRateLimited({
		ipAddress: requestMeta.ipAddress,
		identifier: email,
	});
	if (limited) {
		await logAuthEvent({
			type: 'recovery_rate_limited',
			ipAddress,
			identifier,
			intent,
		});

		return { ok: true };
	}

	// 2. find user by email
	const user = await UserModel.findUserForRecovery(email);

	if (!user) {
		await logAuthEvent({
			type: 'recovery_user_not_found',
			ipAddress,
			identifier,
			intent,
		});

		return { ok: true };
	}

	// 3. check intent-specific eligibility:
	// - a. reset password: verified + has password
	// - b. resend verification: not verified
	// 4. check latest unused token for (user, type)
	// 5. if token exists:
	// - a. if cooldown not passed → generic success without sending
	// - b. otherwise → rotate/update token
	// 6. if token does not exist → create token
	// 7. send correct email
	// 8. log security event
	// 9. return generic success
}
