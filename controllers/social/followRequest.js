//! controllers/social/followRequest.js

import UserModel from '../../models/User.js';
import UserBlocksModel from '../../models/UserBlocks.js';
import UserFollowsModel from '../../models/UserFollows.js';
import UserFollowRequestsModel from '../../models/UserFollowRequests.js';
import UserSocialNotificationsModel from '../../models/UserSocialNotifications.js';
import { fail, success } from '../../services/http/response.js';

const GENERIC_SUCCESS_KEY = 'social:followRequest.success';
const ERROR_PREFIX = 'social:error.';

/**
 * Handle follow request creation.
 *
 * Responsibilities:
 * - resolve identifier to target user
 * - protect privacy with generic success where needed
 * - enforce self/block/follow/request rules
 * - create follow request
 * - create social notification
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
export async function followRequest(req, res, next) {
	const senderId = req.user?.id;
	const { identifier, identifierType, returnTo } = req.body;

	try {
		// 1. sender is a registered user
		if (!senderId)
			return fail(req, res, 'auth:error.auth_required', { to: returnTo });

		// 2. Resolve target user
		const targetUser =
			identifierType === 'email'
				? await UserModel.findByEmailBasic(identifier)
				: await UserModel.findByUsername(identifier);

		// 3. Target exists
		if (!targetUser) {
			return success(req, res, GENERIC_SUCCESS_KEY, {
				modal: 'social',
				to: returnTo,
			});
		}

		const receiverId = targetUser.id;

		// 4. Self-check
		if (senderId === receiverId) {
			return fail(req, res, `${ERROR_PREFIX}cannot_follow_self`, {
				modal: 'social',
				to: returnTo,
			});
		}

		// 5. Sender blocked receiver
		const senderBlockedReceiver = await UserBlocksModel.exists(
			senderId,
			receiverId,
		);
		if (senderBlockedReceiver) {
			return fail(req, res, `${ERROR_PREFIX}you_blocked_this_user`, {
				modal: 'social',
				to: returnTo,
			});
		}

		// 6. Receiver blocked sender
		const receiverBlockedSender = await UserBlocksModel.exists(
			receiverId,
			senderId,
		);
		if (receiverBlockedSender) {
			return success(req, res, GENERIC_SUCCESS_KEY, {
				modal: 'social',
				to: returnTo,
			});
		}

		// 7. Already following
		const alreadyFollowing = await UserFollowsModel.exists(
			senderId,
			receiverId,
		);
		if (alreadyFollowing) {
			return fail(req, res, `${ERROR_PREFIX}already_following`, {
				modal: 'social',
				to: returnTo,
			});
		}

		// 8. Existing pending request
		const pendingRequest = await UserFollowRequestsModel.findPending(
			senderId,
			receiverId,
		);
		if (pendingRequest) {
			return success(req, res, GENERIC_SUCCESS_KEY, {
				modal: 'social',
				to: returnTo,
			});
		}

		// 9. Create follow request
		const followRequest = await UserFollowRequestsModel.create({
			requesterId: senderId,
			targetId: receiverId,
		});

		// 10. Create social notification
		await UserSocialNotificationsModel.create({
			recipientId: receiverId,
			actorId: senderId,
			type: 'follow_request',
			followRequestId: followRequest.id,
		});

		// 11. Success
		return success(req, res, GENERIC_SUCCESS_KEY, {
			modal: 'social',
			to: returnTo,
		});
	} catch (error) {
		next(error);
	}
}
