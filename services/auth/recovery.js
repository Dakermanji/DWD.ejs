//! services/auth/recovery.js

import { isRecoveryRateLimited } from './security.js';
import UserModel from '../../models/User.js';
import { logAuthEvent } from '../../config/passport/strategies/localSecurity.js';
import { prepareRecoveryToken } from './tokens.js';
import { sendRecoveryIntentEmail } from './email.js';

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
 * @param {{ ipAddress?: string, userAgent?: string }} params.requestMeta
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
	const ipAddress = requestMeta.ipAddress;
	const identifier = email;

	// 1. check rate limit
	const limited = await isRecoveryRateLimited({
		ipAddress,
		identifier,
	});
	if (limited) {
		await logAuthEvent({
			eventType: 'recovery_rate_limited',
			identifier,
			...requestMeta,
		});

		return { ok: true };
	}

	// 2. find user by email
	const user = await UserModel.findUserForRecovery(email);

	if (!user) {
		await logAuthEvent({
			eventType: 'recovery_user_not_found',
			identifier,
			...requestMeta,
		});

		return { ok: true };
	}
	const userId = user.id;

	// 3. check intent-specific eligibility:
	if (!isEligibleForRecoveryIntent({ user, intent })) {
		await logAuthEvent({
			eventType: `recovery_ineligible_${intent}`,
			identifier,
			userId,
			...requestMeta,
		});

		return { ok: true };
	}

	// 4. check latest unused token for (user, type)
	// if token exists:
	// - - if cooldown not passed → generic success without sending
	// - - otherwise → rotate/update token
	// - if token does not exist → create token
	const tokenType =
		intent === 'resend_verification'
			? 'signup_verification'
			: 'password_reset';
	const { token } = await prepareRecoveryToken({
		userId,
		type: tokenType,
	});

	// 5. send correct email
	void sendRecoveryIntentEmail({
		type: intent,
		email,
		token,
		locale,
	}).catch((error) => {
		logger.error('recovery email send failed', {
			error: error.message,
			email,
			intent,
			userId,
		});
	});

	// 6. log security event
	await logAuthEvent({
		eventType: `recovery_${intent}`,
		identifier,
		userId,
		...requestMeta,
	});

	// 7. return generic success
	return { ok: true };
}
