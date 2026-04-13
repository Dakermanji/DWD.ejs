//! middlewares/validators/social.js

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
	try {
		// TODO: validate req.body.identifier

		next();
	} catch (error) {
		next(error);
	}
}
