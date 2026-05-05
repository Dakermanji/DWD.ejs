//! controllers/dashboard.js

import UserModel from '../models/User.js';
import { buildAccountOverview } from '../services/dashboard/account.js';
import {
	createAvatarStyleOptions,
	isSupportedAvatarValue,
} from '../services/avatar/dicebear.js';
import { fail, success } from '../services/http/response.js';

const AVATAR_REDIRECT = '/dashboard';
const MAX_AVATAR_VALUE_LENGTH = 96;

/**
 * Render the account dashboard shell.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
export function renderDashboard(req, res) {
	res.render('dashboard/main', {
		styles: ['modals/main', 'dashboard/main'],
		scripts: ['dashboard/avatar'],
		titleKey: 'layout:nav.dashboard',
		account: buildAccountOverview(req),
		avatarStyleOptions: createAvatarStyleOptions(24),
	});
}

export async function updateAvatar(req, res) {
	const avatarSeed = String(req.body?.avatarSeed || '').trim();

	if (
		!avatarSeed ||
		avatarSeed.length > MAX_AVATAR_VALUE_LENGTH ||
		!isSupportedAvatarValue(avatarSeed)
	) {
		return fail(req, res, 'auth:error.avatar_seed_invalid', {
			to: AVATAR_REDIRECT,
		});
	}

	const user = await UserModel.updateAvatarById(req.user.id, avatarSeed);

	if (!user) {
		return fail(req, res, 'common:error.generic', {
			to: AVATAR_REDIRECT,
		});
	}

	req.user.avatar_seed = user.avatar_seed;

	return success(req, res, 'common:avatarUpdated', {
		to: AVATAR_REDIRECT,
	});
}
