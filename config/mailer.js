//! config/mailer.js

/**
 * Nodemailer configuration
 * ------------------------
 * Centralized mail transporter setup for transactional emails.
 *
 * Notes:
 * - Uses environment variables for provider credentials.
 * - Designed to be provider-agnostic (Gmail, Outlook, SES, etc.).
 * - Controllers should NEVER import nodemailer directly.
 */

import nodemailer from 'nodemailer';
import env from './dotenv.js';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
	service: env.EMAIL_SERVICE,
	auth: {
		user: env.EMAIL_ADMIN,
		pass: env.EMAIL_PASSWORD,
	},
});

// Verify transporter on startup
transporter.verify((err) => {
	if (err) {
		logger.error('Mail transporter error', {
			type: 'mail',
			err: err.message,
		});
	} else {
		logger.info('Mail transporter ready', { type: 'mail' });
	}
});

export default transporter;
