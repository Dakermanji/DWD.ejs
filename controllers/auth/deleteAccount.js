//! controllers/auth/deleteAccount.js

import logger from '../../config/logger.js';
import { setLangCookie } from '../../services/i18n/locale.js';
import { confirmAccountDeletion } from '../../services/profile/deletion.js';

const DELETED_REDIRECT = '/?deleted=account';

export async function deleteAccount(req, res, next) {
	try {
		const { token, lang } = req.query;

		setLangCookie(res, lang);

		const result = await confirmAccountDeletion(String(token || ''));

		if (!result.success) {
			req.flash('error', result.reason || 'common:error.generic');
			return res.redirect('/');
		}

		if (req.isAuthenticated?.() && req.user?.id === result.user.id) {
			return req.logout((error) => {
				if (error) {
					return next(error);
				}

				req.session.destroy((destroyError) => {
					if (destroyError) {
						logger.warning(
							'Session destroy after account deletion failed',
							{
								type: 'auth',
								err: destroyError.message,
							},
						);
					}

					return res.redirect(DELETED_REDIRECT);
				});
			});
		}

		return res.redirect(DELETED_REDIRECT);
	} catch (error) {
		return next(error);
	}
}
