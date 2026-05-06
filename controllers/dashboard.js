//! controllers/dashboard.js

import UserModel from '../models/User.js';
import { buildAccountOverview } from '../services/dashboard/account.js';
import {
	createAvatarStyleOptions,
	isSupportedAvatarValue,
} from '../services/avatar/dicebear.js';
import { getCountryOptions, isSupportedCountryCode } from '../services/country/list.js';
import { getLocale } from '../services/i18n/locale.js';
import { fail, success } from '../services/http/response.js';
import { isValidUsername, normalizeText } from '../middlewares/validators/common.js';
import { validateNoProfanity } from '../middlewares/profanity/index.js';

const AVATAR_REDIRECT = '/dashboard';
const DASHBOARD_REDIRECT = '/dashboard';
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
		scripts: ['dashboard/account', 'dashboard/avatar'],
		titleKey: 'layout:nav.dashboard',
		account: buildAccountOverview(req),
	});
}

export function renderAvatarModal(req, res) {
	return res.render('modals/dashboard/_avatar_modal', {
		layout: false,
		account: buildAccountOverview(req),
		avatarStyleOptions: createAvatarStyleOptions(24),
	});
}

export function renderCountryEditor(req, res) {
	return res.render('dashboard/_country_editor', {
		layout: false,
		account: buildAccountOverview(req),
		countryOptions: getCountryOptions(getLocale(req)),
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

export async function updateCountry(req, res) {
	const countryCode = normalizeText(req.body?.countryCode).toUpperCase() || null;

	if (countryCode && !isSupportedCountryCode(countryCode)) {
		return fail(req, res, 'auth:error.country_invalid', {
			to: DASHBOARD_REDIRECT,
		});
	}

	const user = await UserModel.updateCountryById(req.user.id, countryCode);

	if (!user) {
		return fail(req, res, 'common:error.generic', {
			to: DASHBOARD_REDIRECT,
		});
	}

	req.user.country_code = user.country_code;

	return success(req, res, 'common:countryUpdated', {
		to: DASHBOARD_REDIRECT,
	});
}

export async function updateUsername(req, res) {
	const username = normalizeText(req.body?.username);

	if (!isValidUsername(username)) {
		return fail(req, res, 'auth:error.username_invalid', {
			to: DASHBOARD_REDIRECT,
		});
	}

	if (!validateNoProfanity(username)) {
		return fail(req, res, 'auth:error.username_profanity', {
			to: DASHBOARD_REDIRECT,
		});
	}

	if (username === req.user.username) {
		return res.redirect(DASHBOARD_REDIRECT);
	}

	const usernameTaken = await UserModel.usernameExists(username);

	if (usernameTaken) {
		return fail(req, res, 'auth:error.username_taken', {
			to: DASHBOARD_REDIRECT,
		});
	}

	const result = await UserModel.updateUsernameById(req.user.id, username);

	if (!result.success) {
		return fail(req, res, result.reason || 'common:error.generic', {
			to: DASHBOARD_REDIRECT,
		});
	}

	req.user.username = username;

	return success(req, res, 'common:usernameUpdated', {
		to: DASHBOARD_REDIRECT,
	});
}
