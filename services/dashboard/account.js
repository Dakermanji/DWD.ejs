//! services/dashboard/account.js

import { getLocale } from '../i18n/locale.js';
import {
	createUserAvatarDataUri,
	getUserAvatarBackground,
} from '../avatar/dicebear.js';

function normalizeCountryCode(countryCode) {
	if (typeof countryCode !== 'string') {
		return null;
	}

	const normalized = countryCode.trim().toUpperCase();

	return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

function getCountryName(countryCode, locale) {
	if (!countryCode) {
		return null;
	}

	try {
		return (
			new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode) ||
			countryCode
		);
	} catch {
		return countryCode;
	}
}

export function buildAccountOverview(req) {
	const user = req.user;
	const locale = getLocale(req);
	const countryCode = normalizeCountryCode(user?.country_code);
	const avatarSeed = user?.avatar_seed || user?.username || user?.email || 'user';
	const username = user?.username || user?.email?.split('@')[0] || '';

	return {
		username,
		email: user?.email || '',
		avatar: createUserAvatarDataUri(avatarSeed),
		avatarBackground: getUserAvatarBackground(avatarSeed),
		countryCode,
		countryName: getCountryName(countryCode, locale),
	};
}
