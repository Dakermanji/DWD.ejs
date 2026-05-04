//! controllers/social/actions.js

import { buildActionContext } from './actionContext.js';
import { runSocialAction, SOCIAL_ACTIONS } from './actionRunner.js';

/**
 * Handle one shared social action.
 *
 * Responsibilities:
 * - ensure the actor is authenticated
 * - validate the requested action
 * - normalize optional action identifiers
 * - execute the matching social action
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
export async function postSocialAction(req, res, next) {
	try {
		const actorId = req.user?.id;
		const action = String(req.body?.action || '').trim();
		const targetUserId =
			String(req.body?.targetUserId || '').trim() || null;
		const followRequestId =
			String(req.body?.followRequestId || '').trim() || null;
		const notificationId =
			String(req.body?.notificationId || '').trim() || null;

		if (!actorId) {
			res.status(401).json({
				ok: false,
				error: 'auth:error.auth_required',
			});
			return;
		}

		if (!SOCIAL_ACTIONS.has(action)) {
			res.status(400).json({
				ok: false,
				error: 'social:notifications.action_error',
			});
			return;
		}

		const context = await buildActionContext({
			actorId,
			action,
			targetUserId,
			followRequestId,
			notificationId,
		});

		await runSocialAction(context);

		res.json({
			ok: true,
		});
	} catch (error) {
		if (error.code === 'STALE_SOCIAL_ACTION') {
			res.json({
				ok: true,
			});
			return;
		}

		next(error);
	}
}

