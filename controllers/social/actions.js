//! controllers/social/actions.js

import UserBlocksModel from '../../models/UserBlocks.js';
import UserFollowRequestsModel from '../../models/UserFollowRequests.js';
import UserFollowsModel from '../../models/UserFollows.js';
import UserSocialNotificationsModel from '../../models/UserSocialNotifications.js';

const SOCIAL_ACTIONS = new Set([
	'accept_follow_request',
	'reject_follow_request',
	'follow_back',
	'block_user',
	'ignore_notification',
	'unfollow_user',
	'remove_follower',
	'unblock_user',
]);

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

		await runSocialAction({
			actorId,
			action,
			targetUserId,
			followRequestId,
			notificationId,
		});

		res.json({
			ok: true,
		});
	} catch (error) {
		next(error);
	}
}

/**
 * Run one normalized social action.
 *
 * Responsibilities:
 * - resolve trusted identifiers from notification context when available
 * - apply the requested follow / block / notification side effects
 * - keep action-specific branching centralized
 *
 * Notes:
 * - notification-backed actions prefer server-owned context over client input
 * - some actions do not require notification context
 *
 * @param {{
 *   actorId: string,
 *   action: string,
 *   targetUserId: string | null,
 *   followRequestId: string | null,
 *   notificationId: string | null
 * }} params
 * @returns {Promise<void>}
 */
async function runSocialAction({
	actorId,
	action,
	targetUserId,
	followRequestId,
	notificationId,
}) {
	// When a notification is present, use owned notification context as the
	// source of truth for requester / request identifiers.
	const notificationContext = notificationId
		? await requireNotificationOwnership(notificationId, actorId)
		: null;

	if (action === 'accept_follow_request') {
		const effectiveTargetUserId =
			notificationContext?.requester_id || targetUserId;
		const effectiveFollowRequestId =
			notificationContext?.follow_request_id || followRequestId;

		await requireTargetUserId(effectiveTargetUserId);
		await requireFollowRequestId(effectiveFollowRequestId);

		const accepted = await UserFollowRequestsModel.accept(
			effectiveFollowRequestId,
			actorId,
		);
		if (!accepted) {
			throw new Error('Follow request was not accepted');
		}

		await UserFollowsModel.create(effectiveTargetUserId, actorId);

		if (notificationId) {
			await markNotificationHandled(notificationId, actorId);
		}
		return;
	}

	if (action === 'follow_back') {
		const effectiveTargetUserId =
			notificationContext?.requester_id || targetUserId;
		const effectiveFollowRequestId =
			notificationContext?.follow_request_id || followRequestId;

		await requireTargetUserId(effectiveTargetUserId);
		await requireFollowRequestId(effectiveFollowRequestId);

		const accepted = await UserFollowRequestsModel.accept(
			effectiveFollowRequestId,
			actorId,
		);
		if (!accepted) {
			throw new Error('Follow request was not accepted');
		}

		await UserFollowsModel.create(effectiveTargetUserId, actorId);
		await UserFollowsModel.create(actorId, effectiveTargetUserId);

		if (notificationId) {
			await markNotificationHandled(notificationId, actorId);
		}

		// Notify the original requester that the actor is now following them.
		await UserSocialNotificationsModel.create({
			recipientId: effectiveTargetUserId,
			actorId,
			type: 'follow_started',
		});
		return;
	}

	if (action === 'reject_follow_request') {
		const effectiveFollowRequestId =
			notificationContext?.follow_request_id || followRequestId;

		await requireFollowRequestId(effectiveFollowRequestId);

		const rejected = await UserFollowRequestsModel.reject(
			effectiveFollowRequestId,
			actorId,
		);
		if (!rejected) {
			throw new Error('Follow request was not rejected');
		}

		if (notificationId) {
			await markNotificationHandled(notificationId, actorId);
		}
		return;
	}

	if (action === 'block_user') {
		const effectiveTargetUserId =
			notificationContext?.requester_id ||
			notificationContext?.actor_id ||
			targetUserId;
		const effectiveFollowRequestId =
			notificationContext?.follow_request_id || followRequestId;

		await requireTargetUserId(effectiveTargetUserId);

		// Reject the related request when block originates from a request-based
		// notification, then clear follow links in both directions.
		if (effectiveFollowRequestId) {
			await UserFollowRequestsModel.reject(
				effectiveFollowRequestId,
				actorId,
			);
		}

		await UserFollowsModel.removeBothDirections(
			actorId,
			effectiveTargetUserId,
		);
		await UserBlocksModel.create(actorId, effectiveTargetUserId);

		if (notificationId) {
			await markNotificationHandled(notificationId, actorId);
		}
		return;
	}

	if (action === 'ignore_notification') {
		await requireNotificationOwnership(notificationId, actorId);
		await markNotificationHandled(notificationId, actorId);
		return;
	}

	if (action === 'unfollow_user') {
		await requireTargetUserId(targetUserId);
		await UserFollowsModel.removeOneDirection(actorId, targetUserId);
		return;
	}

	if (action === 'remove_follower') {
		await requireTargetUserId(targetUserId);
		await UserFollowsModel.removeOneDirection(targetUserId, actorId);
		return;
	}

	if (action === 'unblock_user') {
		await requireTargetUserId(targetUserId);
		await UserBlocksModel.remove(actorId, targetUserId);
		return;
	}
}

/**
 * Require an actionable notification owned by the recipient.
 *
 * Responsibilities:
 * - ensure a notification id was provided
 * - verify notification ownership
 * - verify the notification is still actionable
 *
 * @param {string | null} notificationId
 * @param {string} recipientId
 * @returns {Promise<object>}
 */
async function requireNotificationOwnership(notificationId, recipientId) {
	if (!notificationId) {
		throw new Error('notificationId is required for this social action');
	}

	const notification =
		await UserSocialNotificationsModel.findActionableByIdForRecipient(
			notificationId,
			recipientId,
		);

	if (!notification) {
		throw new Error(
			'Notification was not found or is no longer actionable',
		);
	}

	return notification;
}

/**
 * Mark a notification as read and handled.
 *
 * Responsibilities:
 * - update read state
 * - update handled state
 * - keep notification completion logic centralized
 *
 * @param {string | null} notificationId
 * @param {string} recipientId
 * @returns {Promise<void>}
 */
async function markNotificationHandled(notificationId, recipientId) {
	const updated = await UserSocialNotificationsModel.markAsReadAndHandled(
		notificationId,
		recipientId,
	);

	if (!updated) {
		throw new Error('Notification could not be marked as handled');
	}
}

/**
 * Require a target user id for actions that operate on another user.
 *
 * @param {string | null} targetUserId
 * @returns {Promise<void>}
 */
async function requireTargetUserId(targetUserId) {
	if (!targetUserId) {
		throw new Error('targetUserId is required for this social action');
	}
}

/**
 * Require a follow request id for actions that resolve a request.
 *
 * @param {string | null} followRequestId
 * @returns {Promise<void>}
 */
async function requireFollowRequestId(followRequestId) {
	if (!followRequestId) {
		throw new Error('followRequestId is required for this social action');
	}
}
