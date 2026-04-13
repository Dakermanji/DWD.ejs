//! controllers/social/followRequest.js

/**
 * Handle follow request creation.
 *
 * Responsibilities:
 * - resolve identifier to user
 * - check block rules
 * - create follow request
 * - create notification
 * - respond with success or failure
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
export async function followRequest(req, res, next) {
	try {
		// TODO: implement follow request logic

		return res.redirect(res.locals.currentUrl || '/');
	} catch (error) {
		next(error);
	}
}
