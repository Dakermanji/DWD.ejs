//! controllers/social/notifications.js

import UserSocialNotificationsModel from '../../models/UserSocialNotifications.js';

/**
 * Return notifications for the signed-in user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
export async function getNotifications(req, res, next) {
	try {
		const recipientId = req.user?.id;

		if (!recipientId) {
			res.status(401).json({
				ok: false,
				error: 'auth:error.auth_required',
			});
			return;
		}

		const notifications =
			await UserSocialNotificationsModel.findByRecipient(recipientId);

		res.json({
			ok: true,
			notifications,
		});
	} catch (error) {
		next(error);
	}
}
