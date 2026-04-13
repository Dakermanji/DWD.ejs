//! middlewares/validators/social.js

import { sanitizeReturnTo } from './common.js';
import { fail } from '../../services/http/response.js';

const ERROR_PREFIX = 'social:error.';

/**
 * Validate follow request input.
 *
 * Responsibilities:
 * - validate identifier (username or email)
 * - normalize input
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validateFollowRequest(req, res, next) {
	const identifierRaw = req.body?.identifier;
	const KEY = `${ERROR_PREFIX}invalid_identifier`;
	const returnToRaw = req.body?.returnTo;
	req.body.returnTo = sanitizeReturnTo(returnToRaw);

	try {
		if (!req.user) return fail(req, res, 'auth:error.not_auth');
		if (!isSafeString(identifierRaw, MAX_IDENTIFIER_LENGTH))
			return fail(req, res, KEY, { modal: 'social' });

		const email = normalizeEmail(identifierRaw);

		if (isValidEmail(email) && isSafeEmail(email)) {
			req.body.identifier = email;
			req.body.identifierType = 'email';
			return next();
		}

		const username = normalizeText(identifierRaw);

		if (isValidUsername(username)) {
			req.body.identifier = username;
			req.body.identifierType = 'username';
			return next();
		}

		return fail(req, res, KEY, { modal: 'social' });
	} catch (error) {
		next(error);
	}
}
