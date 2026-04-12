//! controllers/auth/setUsername.js

import { fail, success } from '../../services/http/response.js';

/**
 * Complete OAuth signup by assigning a unique username.
 *
 * Responsibilities:
 * - ensure username is still available
 * - persist username for the authenticated user
 * - return appropriate success or failure response
 *
 * Expected state:
 * - req.user is defined (validated by middleware)
 * - req.user.username is not set yet
 * - req.body.username is validated and normalized
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
export async function setUsername(req, res, next) {
	try {
		const user = req.user;
		const username = req.body.username;

		// check if username is already taken by another user
		const existingUser = await UserModel.findByUsername(username);

		if (existingUser)
			return fail(req, res, `auth:error.username_taken`, {
				// reopen OAuth completion modal if username is unavailable
				modal: 'complete_signup_oauth',
			});

		// persist username for current user
		await UserModel.updateUsernameById(user.id, username);

		// notify success (user completed OAuth signup)
		return success(req, res, `auth:signup.success`);
	} catch (error) {
		next(error);
	}
}
