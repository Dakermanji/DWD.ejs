//! services/contact/email.js

import env from '../../config/dotenv.js';
import logger from '../../config/logger.js';
import transporter from '../../config/mailer.js';

function escapeHtml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

/**
 * Send a contact form message from a signed-in user.
 *
 * @param {Object} params
 * @param {{ id: string, email: string, username?: string | null }} params.user
 * @param {string} params.subject
 * @param {string} params.message
 * @returns {Promise<void>}
 */
export async function sendContactEmail({ user, subject, message }) {
	const senderName = user.username || user.email;
	const mailSubject = `Contact form: ${subject}`;
	const text = [
		`From: ${senderName}`,
		`Email: ${user.email}`,
		'',
		message,
	].join('\n');

	await transporter.sendMail({
		from: env.EMAIL_ADMIN,
		to: env.EMAIL_ADMIN,
		replyTo: user.email,
		subject: mailSubject,
		text,
		html: `
			<p><strong>From:</strong> ${escapeHtml(senderName)}</p>
			<p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
			<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
			<hr>
			<p>${escapeHtml(message).replaceAll('\n', '<br>')}</p>
		`,
	});

	logger.success('Contact email sent', {
		type: 'mail',
		userId: user.id,
		email: user.email,
	});
}

export default {
	sendContactEmail,
};
