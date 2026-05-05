//! controllers/avatar.js

import { createAvatarStyleOption } from '../services/avatar/dicebear.js';

/**
 * Return a fresh set of generated avatar choices for one DiceBear style.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {import('express').Response}
 */
export function refreshAvatarStyle(req, res) {
	const style = createAvatarStyleOption(req.params.style);

	if (!style) {
		return res.status(404).json({
			error: 'avatar_style_not_found',
		});
	}

	return res.json({ style });
}
