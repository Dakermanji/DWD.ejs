//! middlewares/validators/auth.js

import {
	isSafeEmail,
	isValidEmail,
	isValidPassword,
	normalizeText,
	normalizeEmail,
	isSafeString,
	isValidLang,
	isValidUsername,
	parseIdentifier,
} from './common.js';
import { isValidToken, normalizeToken } from './token.js';
import { validateNoProfanity } from '../profanity/index.js';
import { fail } from '../../services/http/response.js';

const ERROR_PREFIX = 'auth:error.';

const MAX_PASSWORD_LENGTH = 1024;

/**
 * Validated and normalized an email field from the request body.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware.
 * @param {{ modal: string }} options - Modal name used in the failure response.
 * @returns {void}
 */
export function validateEmailField(req, res, next, { modal }) {
	const email = normalizeEmail(req.body?.email);

	if (!isValidEmail(email) || !isSafeEmail(email))
		return fail(req, res, `${ERROR_PREFIX}email_invalid`, { modal });

	req.body.email = email;
	next();
}

/**
 * Created a query validator for token-based auth links.
 *
 * It validated the token and an optional 2-letter language code, then
 * normalized both values before passing control to the next middleware.
 *
 * @param {string} errorKey - Flash key used when the link was invalid.
 * @returns {import('express').RequestHandler}
 */
export const validateTokenAndLangQuery = (errorKey) => {
	return function (req, res, next) {
		const { token, lang } = req.query;

		const normalizedToken = normalizeToken(token);
		const normalizedLang = normalizeText(lang, { lower: true });

		if (!isValidToken(token) || (lang && !isValidLang(normalizedLang))) {
			req.flash('error', errorKey);
			return res.redirect('/');
		}

		req.query.token = normalizedToken;
		req.query.lang = normalizedLang;

		next();
	};
};

export const validateVerifyEmailQuery = validateTokenAndLangQuery(
	`${ERROR_PREFIX}verify_email_invalid_link`,
);

export const validateResetPasswordQuery = validateTokenAndLangQuery(
	`${ERROR_PREFIX}reset_password_invalid_link`,
);

/**
 * Validated the final step of local signup.
 *
 * It collected validation errors instead of failing immediately so the
 * caller could display all relevant feedback at once.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware.
 * @returns {void}
 */
export function validateCompleteLocalSignup(req, res, next) {
	const { token, username, password, confirmPassword } = req.body;
	const errors = [];

	const normalizedToken = normalizeToken(token);
	const normalizedUsername = normalizeText(username);

	if (!isValidToken(token))
		errors.push(`${ERROR_PREFIX}verify_email_invalid_link`);

	if (!isValidUsername(normalizedUsername))
		errors.push(`${ERROR_PREFIX}username_invalid`);

	if (!validateNoProfanity(normalizedUsername))
		errors.push(`${ERROR_PREFIX}username_profanity`);

	if (!isValidPassword(password)) errors.push(`${ERROR_PREFIX}password_weak`);

	if (password !== confirmPassword)
		errors.push(`${ERROR_PREFIX}password_mismatch`);

	req.body.token = normalizedToken;
	req.body.username = normalizedUsername;
	req.validationErrors = errors;
	next();
}

/**
 * Validated a sign-in request using either email or username.
 *
 * It normalized the identifier and stored its resolved type on the request.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware.
 * @returns {void}
 */
export function validateSignIn(req, res, next) {
	const identifierRaw = req.body?.identifier;
	const passwordRaw = req.body?.password;
	const key = `${ERROR_PREFIX}invalid_credentials`;

	if (!isSafeString(passwordRaw, MAX_PASSWORD_LENGTH))
		return fail(req, res, key, { modal: 'signin' });

	const parsedIdentifier = parseIdentifier(identifierRaw);

	if (!parsedIdentifier) return fail(req, res, key, { modal: 'signin' });

	req.body.identifier = parsedIdentifier.identifier;
	req.body.identifierType = parsedIdentifier.identifierType;
	req.body.password = passwordRaw;
	next();
}

export const validateSignupEmail = (req, res, next) =>
	validateEmailField(req, res, next, { modal: 'signup' });

export const validateRecoveryEmail = (req, res, next) =>
	validateEmailField(req, res, next, { modal: 'recovery' });

/**
 * Validated the recovery action selected by the user.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware.
 * @returns {void}
 */
export function validateRecoveryIntent(req, res, next) {
	const intent = req.body?.intent;

	if (intent !== 'password_reset' && intent !== 'resend_verification')
		return fail(req, res, `common:error.invalid_request`, {
			modal: 'recovery',
		});

	next();
}

/**
 * Validated a password reset form submission.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware.
 * @returns {void}
 */
export function validateResetPassword(req, res, next) {
	const modal = 'reset_password';
	const { token, password, confirmPassword } = req.body;
	const normalizedToken = normalizeToken(token);

	if (!isValidToken(normalizedToken))
		return fail(req, res, `${ERROR_PREFIX}reset_password_invalid_link`, {
			modal,
		});

	if (!password || !isValidPassword(password))
		return fail(req, res, `${ERROR_PREFIX}password_weak`, {
			modal,
		});

	if (password !== confirmPassword)
		return fail(req, res, `${ERROR_PREFIX}password_mismatch`, {
			modal,
		});

	req.body.token = normalizedToken;
	next();
}

export function validateSetUsername(req, res, next) {
	const user = req.user;
	const username = normalizeText(req.body?.username);

	if (!user) return fail(req, res, `${ERROR_PREFIX}auth_required`);

	if (user.username) return res.redirect('/');

	if (!isValidUsername(username))
		return fail(req, res, `${ERROR_PREFIX}username_invalid`, {
			modal: 'complete_signup_oauth',
		});

	if (!validateNoProfanity(username))
		return fail(req, res, `${ERROR_PREFIX}username_profanity`, {
			modal: 'complete_signup_oauth',
		});

	req.body.username = username;
	next();
}
