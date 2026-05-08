//! services/profile/preferences.js

import { SUPPORTED_LANGUAGES } from '../../config/languages.js';
import { THEME_VALUES } from '../theme/preference.js';

const THEME_ICONS = {
	light: 'bi-sun',
	dark: 'bi-moon-stars',
	system: 'bi-circle-half',
};

export function buildProfilePreferences(req) {
	return {
		currentLanguage: req.user?.locale || 'en',
		languages: SUPPORTED_LANGUAGES,
		themes: [...THEME_VALUES].map((theme) => ({
			key: theme,
			icon: THEME_ICONS[theme] || 'bi-circle-half',
		})),
	};
}
