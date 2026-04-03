//! controllers/auth/signupLocal.js

import logger from '../../config/logger.js';
import UserModel from '../../models/User.js';
import AuthSecurityEventModel from '../../models/AuthSecurityEvent.js';
import SignupSecurityModel from '../../models/SignupSecurity.js';
import { getRequestMeta } from '../../services/auth/requestMeta.js';
import {
	isLocked,
	isEmailCooldownActive,
	lockIpIfNeeded,
} from '../../services/auth/signupSecurity.js';
import { createPendingSignupAndSendEmail } from '../../services/auth/signupLocal.js';
import { SUPPORTED_LANGUAGE_SET } from '../../config/languages.js';

/**
 * Generic signup success message key.
 *
 * Keep this the same across normal signup outcomes
 * to avoid leaking whether the email already exists.
 */
const SIGNUP_SUCCESS_KEY = 'auth:signup.check_your_email';

/**
 * Handle generic signup success response.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {void}
 */
function respondSignupSuccess(req, res) {
	req.flash('success', SIGNUP_SUCCESS_KEY);
	res.redirect('/');
}

/**
 * Log signup-related auth event.
 *
 * @param {{
 *   userId?: string | null,
 *   email: string,
 *   eventType: string,
 *   requestMeta: {
 *     ipAddress: string | null,
 *     userAgent: string | null
 *   }
 * }} params
 * @returns {Promise<void>}
 */
async function logSignupEvent({
	userId = null,
	email,
	eventType,
	requestMeta,
}) {
	await AuthSecurityEventModel.insertAuthEvent({
		userId,
		identifier: email,
		eventType,
		ipAddress: requestMeta.ipAddress,
		userAgent: requestMeta.userAgent,
	});
}

/**
 * Check whether signup should silently stop due to IP lock or email cooldown.
 *
 * Responsibilities:
 * - check IP lock
 * - check email cooldown
 * - log security event when blocked
 *
 * @param {{
 *   email: string,
 *   requestMeta: {
 *     ipAddress: string | null,
 *     userAgent: string | null
 *   }
 * }} params
 * @returns {Promise<boolean>}
 * - true  -> stop signup flow and return generic success
 * - false -> continue signup flow
 */
async function shouldStopSignupEarly({ email, requestMeta }) {
	const ipSecurity = await SignupSecurityModel.findLatestByIp(
		requestMeta.ipAddress,
	);

	if (!ipSecurity) return false;

	if (isLocked(ipSecurity)) {
		await logSignupEvent({
			userId: null,
			email,
			eventType: 'signup_rate_limited',
			requestMeta,
		});

		return true;
	}

	const emailSecurity = await SignupSecurityModel.findLatestByEmail(email);

	if (emailSecurity?.attempt_count < 5) return false;

	if (isEmailCooldownActive(emailSecurity)) {
		await logSignupEvent({
			userId: null,
			email,
			eventType: 'signup_email_cooldown',
			requestMeta,
		});

		return true;
	}

	return false;
}

/**
 * Record signup attempt security state.
 *
 * Responsibilities:
 * - increment signup attempt counter
 * - apply IP lock when threshold is reached
 *
 * @param {{
 *   ipAddress: string | null,
 *   email: string
 * }} params
 * @returns {Promise<void>}
 */
async function recordSignupSecurity({ ipAddress, email }) {
	await SignupSecurityModel.recordAttempt({
		ipAddress,
		email,
	});

	await lockIpIfNeeded({
		ipAddress,
		email,
	});
}

/**
 * Handle local signup step 1.
 *
 * Flow:
 * - receives validated and normalized email
 * - applies signup security checks
 * - records signup attempt security state
 * - checks whether the email is already registered
 * - creates pending user + verification token + email when needed
 * - always returns the same success response on normal flow
 *
 * Why the response is generic:
 * - prevents email enumeration
 *
 * Notes:
 * - this step does not complete registration yet
 * - password and username are collected later
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function signupLocal(req, res) {
	const { email } = req.body;
	let locale = req.locale || 'en';
	if (!SUPPORTED_LANGUAGE_SET.has(locale)) {
		locale = 'en';
	}

	const requestMeta = getRequestMeta(req);

	try {
		const shouldStopEarly = await shouldStopSignupEarly({
			email,
			requestMeta,
		});

		if (shouldStopEarly) {
			return respondSignupSuccess(req, res);
		}

		await recordSignupSecurity({
			ipAddress: requestMeta.ipAddress,
			email,
		});

		const existingUser = await UserModel.findByEmailBasic(email);

		await logSignupEvent({
			userId: existingUser?.id ?? null,
			email,
			eventType: 'signup_attempt',
			requestMeta,
		});

		if (!existingUser) {
			const user = await createPendingSignupAndSendEmail({
				email,
				locale,
			});

			await logSignupEvent({
				userId: user.id,
				email,
				eventType: 'signup_email_sent',
				requestMeta,
			});
		}

		return respondSignupSuccess(req, res);
	} catch (error) {
		logger.error('signupLocal error', {
			error: error.message,
		});

		req.flash('error', 'common:unexpected_error');
		return res.redirect('/');
	}
}
