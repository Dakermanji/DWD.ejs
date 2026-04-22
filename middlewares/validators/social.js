//! middlewares/validators/social.js

import { parseIdentifier, sanitizeReturnTo } from './common.js';
import { fail } from '../../services/http/response.js';

const ERROR_PREFIX = 'social:error.';

/**
 * Validate follow request input.
 *
 * Responsibilities:
 * - validate identifier (username or email)
 * - normalize input
 * - sanitize returnTo for safe internal redirect
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function validateFollowRequest(req, res, next) {
	const key = `${ERROR_PREFIX}invalid_identifier`;

	try {
		req.body.returnTo = sanitizeReturnTo(req.body?.returnTo);

		if (!req.user)
			return fail(req, res, 'auth:error.auth_required', {
				to: req.body.returnTo,
			});

		const parsedIdentifier = parseIdentifier(req.body?.identifier);

		if (!parsedIdentifier) {
			return fail(req, res, key, {
				modal: 'social',
				to: req.body.returnTo,
			});
		}

		req.body.identifier = parsedIdentifier.identifier;
		req.body.identifierType = parsedIdentifier.identifierType;

		next();
	} catch (error) {
		next(error);
	}
}
