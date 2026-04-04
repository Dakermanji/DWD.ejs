//! services/auth/email.js

import env from '../../config/dotenv.js';
import transporter from '../../config/mailer.js';
import emailContent from './emailContent.js';
import logger from '../../config/logger.js';

/**
 * Send signup email with verification link.
 *
 * @param {string} email
 * @param {string} token
 * @param {string} locale
 * @returns {Promise<void>}
 */
export async function sendSignupEmail(email, token, locale = 'en') {
	const safeLocale = Object.hasOwn(emailContent.signupEmailContent, locale)
		? locale
		: 'en';

	const verifyUrl = `${env.CLIENT_URL}/auth/verify-email?token=${encodeURIComponent(token)}&lang=${safeLocale}`;
	const content = emailContent.signupEmailContent[safeLocale];

	await transporter.sendMail({
		from: env.EMAIL_ADMIN,
		to: email,
		subject: content.subject,
		html: content.html(verifyUrl),
	});

	logger.success('Signup email sent', {
		type: 'mail',
		email: email,
	});
}

export default {
	sendSignupEmail,
};
