//! models/user/preferences.js

import { query } from '../../config/database.js';

export async function updateLocale(userId, locale) {
	const q = `
		UPDATE users
		SET locale = $1, updated_at = NOW()
		WHERE id = $2;
	`;

	const result = await query(q, [locale, userId]);
	return result.rowCount > 0;
}

export async function updateTheme(userId, theme) {
	const q = `
		UPDATE users
		SET theme = $1, updated_at = NOW()
		WHERE id = $2;
	`;

	const result = await query(q, [theme, userId]);
	return result.rowCount > 0;
}
