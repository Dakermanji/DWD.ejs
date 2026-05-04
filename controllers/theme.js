//! controllers/theme.js

import UserModel from '../models/User.js';
import { isSupportedTheme } from '../services/theme/preference.js';

export async function updateTheme(req, res, next) {
	try {
		const userId = req.user?.id;
		const theme = String(req.body?.theme || '').trim();

		if (!userId) {
			return res.status(401).json({
				ok: false,
				error: 'auth:error.auth_required',
			});
		}

		if (!isSupportedTheme(theme)) {
			return res.status(400).json({
				ok: false,
				error: 'common:error.invalid_request',
			});
		}

		const updated = await UserModel.updateTheme(userId, theme);

		if (!updated) {
			return res.status(404).json({
				ok: false,
				error: 'common:error.invalid_request',
			});
		}

		req.user.theme = theme;

		return res.json({
			ok: true,
			theme,
		});
	} catch (error) {
		return next(error);
	}
}
