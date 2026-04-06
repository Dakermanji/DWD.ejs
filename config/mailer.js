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
	host: env.EMAIL_HOST,
	port: env.EMAIL_PORT,
	secure: Number(env.EMAIL_PORT) === 465,
	auth: {
		user: env.EMAIL_ADMIN,
		pass: env.EMAIL_PASSWORD, // app password
	},
	connectionTimeout: 15_000,
	greetingTimeout: 10_000,
	socketTimeout: 20_000,
	dnsTimeout: 10_000,
});

transporter
	.verify()
	.then(() => {
		logger.info('Mail transporter ready', { type: 'mail' });
	})
	.catch((err) => {
		logger.error('Mail transporter error', {
			type: 'mail',
			err: err.message,
			code: err.code,
			command: err.command,
		});
	});

export default transporter;
