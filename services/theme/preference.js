//! services/theme/preference.js

export const THEME_VALUES = new Set(['system', 'light', 'dark']);

export function isSupportedTheme(theme) {
	return THEME_VALUES.has(theme);
}

export function getThemePreference(req) {
	const theme = req.user?.theme;

	return isSupportedTheme(theme) ? theme : 'system';
}
