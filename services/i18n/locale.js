//! services/i18n/locale.js

import { SUPPORTED_LANGUAGE_SET } from '../../config/languages.js';

/**
 * Set language cookie if valid.
 *
 * Responsibilities:
 * - validate locale against supported languages
 * - centralize cookie configuration
 * - avoid repetition across controllers
 *
 * @param {import('express').Response} res
 * @param {string | null | undefined} lang
 */
export function setLangCookie(res, lang) {
	if (!lang || !SUPPORTED_LANGUAGE_SET.has(lang)) {
		return;
	}

	res.cookie('lang', lang, {
		httpOnly: false,
		sameSite: 'lax',
		maxAge: 1000 * 60 * 60 * 24 * 30,
	});
}

/**
 * Resolve the current request locale.
 *
 * Responsibilities:
 * - prioritize OAuth session locale when present
 * - fallback to i18next-detected language
 * - ensure a valid default when no language is resolved
 *
 * Priority order:
 * 1. req.session.oauthLocale (captured before OAuth redirect)
 * 2. req.language (primary i18next detected language)
 * 3. req.resolvedLanguage (fallback from i18next)
 * 4. 'en' (application default)
 *
 * @param {import('express').Request} req - Express request object
 * @returns {string} Resolved locale code (e.g. 'en', 'fr', 'ar')
 */
export function getLocale(req) {
	return (
		req.session?.oauthLocale || req.language || req.resolvedLanguage || 'en'
	);
}
