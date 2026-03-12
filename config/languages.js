//! config/languages.js

/**
 * Supported application languages.
 *
 * code → ISO language code used by i18next
 * flag → flag image name located in /public/images/flags
 * name → native language label for UI
 */

export const SUPPORTED_LANGUAGES = [
	{ code: 'ar', flag: 'sy', name: 'العربية' },
	{ code: 'en', flag: 'ca', name: 'English' },
	{ code: 'fr', flag: 'qc', name: 'Français' },
];

/**
 * Array of supported language codes.
 * Example: ['ar', 'en', 'fr']
 */
export const SUPPORTED_LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

/**
 * Set version for faster membership checks.
 */
export const SUPPORTED_LANGUAGE_SET = new Set(SUPPORTED_LANGUAGE_CODES);
