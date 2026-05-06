//! controllers/profile.js

import UserModel from '../models/User.js';
import { buildAccountOverview } from '../services/profile/account.js';
import {
	createAvatarStyleOptions,
	isSupportedAvatarValue,
} from '../services/avatar/dicebear.js';
import { getCountryOptions, isSupportedCountryCode } from '../services/country/list.js';
import { getLocale } from '../services/i18n/locale.js';
import { fail, success } from '../services/http/response.js';
import { isValidUsername, normalizeText } from '../middlewares/validators/common.js';
import { validateNoProfanity } from '../middlewares/profanity/index.js';

const AVATAR_REDIRECT = '/profile';
const PROFILE_REDIRECT = '/profile';
const MAX_AVATAR_VALUE_LENGTH = 96;

/**
 * Render the account profile shell.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
export function renderProfile(req, res) {
	res.render('profile/main', {
		styles: ['modals/main', 'profile/main'],
		scripts: ['profile/account', 'profile/avatar'],
		titleKey: 'layout:nav.profile',
		account: buildAccountOverview(req),
	});
}

export function renderAvatarModal(req, res) {
	return res.render('modals/profile/_avatar_modal', {
		layout: false,
		account: buildAccountOverview(req),
		avatarStyleOptions: createAvatarStyleOptions(24),
	});
}

export function renderCountryEditor(req, res) {
	return res.render('profile/_country_editor', {
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
			to: PROFILE_REDIRECT,
		});
	}

	const user = await UserModel.updateCountryById(req.user.id, countryCode);

	if (!user) {
		return fail(req, res, 'common:error.generic', {
			to: PROFILE_REDIRECT,
		});
	}

	req.user.country_code = user.country_code;

	return success(req, res, 'common:countryUpdated', {
		to: PROFILE_REDIRECT,
	});
}

export async function updateUsername(req, res) {
	const username = normalizeText(req.body?.username);

	if (!isValidUsername(username)) {
		return fail(req, res, 'auth:error.username_invalid', {
			to: PROFILE_REDIRECT,
		});
	}

	if (!validateNoProfanity(username)) {
		return fail(req, res, 'auth:error.username_profanity', {
			to: PROFILE_REDIRECT,
		});
	}

	if (username === req.user.username) {
		return res.redirect(PROFILE_REDIRECT);
	}

	const usernameTaken = await UserModel.usernameExists(username);

	if (usernameTaken) {
		return fail(req, res, 'auth:error.username_taken', {
			to: PROFILE_REDIRECT,
		});
	}

	const result = await UserModel.updateUsernameById(req.user.id, username);

	if (!result.success) {
		return fail(req, res, result.reason || 'common:error.generic', {
			to: PROFILE_REDIRECT,
		});
	}

	req.user.username = username;

	return success(req, res, 'common:usernameUpdated', {
		to: PROFILE_REDIRECT,
	});
}
