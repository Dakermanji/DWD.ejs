//! controllers/social/actions.js

import UserBlocksModel from '../../models/UserBlocks.js';
import UserFollowRequestsModel from '../../models/UserFollowRequests.js';
import UserFollowsModel from '../../models/UserFollows.js';
import UserSocialNotificationsModel from '../../models/UserSocialNotifications.js';
import {
	buildActionContext,
	getFollowRequestActorId,
	getFollowRequestId,
	getPendingNotificationFollowRequestId,
	getTargetUserId,
	requireFollowRequestId,
	requireNotificationContext,
	requireTargetUserId,
} from './actionContext.js';

const SOCIAL_ACTIONS = new Set([
	'accept_follow_request',
	'reject_follow_request',
	'follow_back',
	'block_user',
	'ignore_notification',
	'unfollow_user',
	'remove_follower',
	'remove_follow_relationships',
	'unblock_user',
	'unblock_and_follow_request',
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
async function runSocialAction(context) {
	const { actorId, action, targetUserId, notificationId } = context;

	if (action === 'accept_follow_request') {
		const effectiveTargetUserId = getFollowRequestActorId(context);
		const effectiveFollowRequestId = getFollowRequestId(context);

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

		await UserSocialNotificationsModel.create({
			recipientId: effectiveTargetUserId,
			actorId,
			type: 'follow_request_accepted',
			followRequestId: effectiveFollowRequestId,
		});
		return;
	}

	if (action === 'follow_back') {
		const effectiveTargetUserId = getFollowRequestActorId(context);
		const effectiveFollowRequestId = getFollowRequestId(context);

		await requireTargetUserId(effectiveTargetUserId);

		if (effectiveFollowRequestId) {
			const accepted = await UserFollowRequestsModel.accept(
				effectiveFollowRequestId,
				actorId,
			);
			if (!accepted) {
				throw new Error('Follow request was not accepted');
			}
		}

		await UserFollowsModel.create(actorId, effectiveTargetUserId);

		if (effectiveFollowRequestId) {
			await UserFollowsModel.create(effectiveTargetUserId, actorId);
		}

		if (notificationId) {
			await markNotificationHandled(notificationId, actorId);
		}

		if (effectiveFollowRequestId) {
			await UserSocialNotificationsModel.create({
				recipientId: effectiveTargetUserId,
				actorId,
				type: 'follow_request_accepted_followed_back',
				followRequestId: effectiveFollowRequestId,
			});
		} else {
			await UserSocialNotificationsModel.create({
				recipientId: effectiveTargetUserId,
				actorId,
				type: 'follow_started',
			});
		}
		return;
	}

	if (action === 'reject_follow_request') {
		const effectiveFollowRequestId = getFollowRequestId(context);

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
		const effectiveTargetUserId = getTargetUserId(context);
		const effectiveFollowRequestId =
			getPendingNotificationFollowRequestId(context);

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
		await requireNotificationContext(context);
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

	if (action === 'remove_follow_relationships') {
		await requireTargetUserId(targetUserId);
		await UserFollowsModel.removeBothDirections(actorId, targetUserId);
		return;
	}

	if (action === 'unblock_user') {
		await requireTargetUserId(targetUserId);
		const unblocked = await UserBlocksModel.remove(actorId, targetUserId);
		if (!unblocked) {
			throw new Error('User was not blocked');
		}
		return;
	}

	if (action === 'unblock_and_follow_request') {
		await requireTargetUserId(targetUserId);
		const unblocked = await UserBlocksModel.remove(actorId, targetUserId);
		if (!unblocked) {
			throw new Error('User was not blocked');
		}
		await requestFollowAfterUnblock(actorId, targetUserId);
		return;
	}
}

/**
 * Request or create a follow after removing a block.
 *
 * @param {string} requesterId
 * @param {string} targetId
 * @returns {Promise<void>}
 */
async function requestFollowAfterUnblock(requesterId, targetId) {
	const targetBlockedRequester = await UserBlocksModel.exists(
		targetId,
		requesterId,
	);
	if (targetBlockedRequester) return;

	const alreadyFollowing = await UserFollowsModel.exists(
		requesterId,
		targetId,
	);
	if (alreadyFollowing) return;

	const requesterPendingRequest = await UserFollowRequestsModel.findPending(
		requesterId,
		targetId,
	);
	if (requesterPendingRequest) return;

	const targetPendingRequest = await UserFollowRequestsModel.findPending(
		targetId,
		requesterId,
	);
	if (targetPendingRequest) {
		const accepted = await UserFollowRequestsModel.accept(
			targetPendingRequest.id,
			requesterId,
		);
		if (!accepted) {
			throw new Error('Could not accept reverse pending follow request');
		}

		await UserFollowsModel.create(targetId, requesterId);
		await UserFollowsModel.create(requesterId, targetId);
		await UserSocialNotificationsModel.markFollowRequestNotificationsAsReadAndHandled(
			targetPendingRequest.id,
			requesterId,
		);

		await UserSocialNotificationsModel.create({
			recipientId: targetId,
			actorId: requesterId,
			type: 'follow_request_accepted_followed_back',
			followRequestId: targetPendingRequest.id,
		});
		return;
	}

	const targetAlreadyFollowingRequester = await UserFollowsModel.exists(
		targetId,
		requesterId,
	);
	if (targetAlreadyFollowingRequester) {
		await UserFollowsModel.create(requesterId, targetId);
		await UserSocialNotificationsModel.create({
			recipientId: targetId,
			actorId: requesterId,
			type: 'follow_started',
		});
		return;
	}

	const followRequest = await UserFollowRequestsModel.create({
		requesterId,
		targetId,
	});
	if (!followRequest) {
		throw new Error('Could not create follow request');
	}

	await UserSocialNotificationsModel.create({
		recipientId: targetId,
		actorId: requesterId,
		type: 'follow_request',
		followRequestId: followRequest.id,
	});
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
