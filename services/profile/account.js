//! services/profile/account.js

import { getLocale } from '../i18n/locale.js';
import { getUserAvatarProfile } from '../avatar/dicebear.js';

const AUTH_METHODS = [
	{
		key: 'email',
		label: 'Email',
		icon: 'bi bi-envelope-fill',
	},
	{
		key: 'google',
		label: 'Google',
		partial: '../partials/_googleLogo',
	},
	{
		key: 'github',
		label: 'GitHub',
		partial: '../partials/_githubLogo',
	},
	{
		key: 'discord',
		label: 'Discord',
		partial: '../partials/_discordLogo',
	},
];

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

function normalizeProviders(providers) {
	if (Array.isArray(providers)) {
		return providers.map(String);
	}

	if (typeof providers === 'string') {
		return providers
			.replace(/[{}"]/g, '')
			.split(',')
			.map((provider) => provider.trim())
			.filter(Boolean);
	}

	return [];
}

export function buildAccountOverview(req) {
	const user = req.user;
	const locale = getLocale(req);
	const countryCode = normalizeCountryCode(user?.country_code);
	const avatarSeed = user?.avatar_seed || user?.username || user?.email || 'user';
	const avatar = getUserAvatarProfile(avatarSeed);
	const username = user?.username || user?.email?.split('@')[0] || '';
	const connectedProviders = new Set(normalizeProviders(user?.providers));
	const hasPassword = Boolean(user?.has_password);
	const authMethods = AUTH_METHODS.map((method) => ({
		...method,
		connected:
			method.key === 'email' ? hasPassword : connectedProviders.has(method.key),
	}));

	return {
		username,
		email: user?.email || '',
		avatar,
		countryCode,
		countryName: getCountryName(countryCode, locale),
		hasPassword,
		authMethods,
	};
}
