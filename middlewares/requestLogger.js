//! middlewares/requestLogger.js

/**
 * HTTP Request Logger Middleware
 *
 * Integrates Morgan with the centralized Winston logger.
 *
 * Why this file exists:
 * - Captures incoming HTTP requests
 * - Keeps request logs consistent with the application's log format
 * - Tags request logs with the "request" type for easier filtering
 *
 * Example output:
 * 2026-03-11 10:00:00 ℹ️ 📡 [REQUEST] GET / 200 4.231 ms
 */

import morgan from 'morgan';

import logger from '../config/logger.js';

/**
 * Registers HTTP request logging middleware.
 *
 * Morgan formats request details and forwards each log line
 * to the centralized Winston logger.
 *
 * @param {import('express').Express} app - Express application instance
 */
export default function requestLogger(app) {
	app.use(
		morgan(':method :url :status :response-time ms', {
			stream: {
				/**
				 * Writes Morgan log output into the centralized logger.
				 *
				 * Morgan appends a trailing newline to each message,
				 * so `trim()` is used to keep log output clean.
				 *
				 * @param {string} message - Formatted Morgan log message
				 */
				write(message) {
					logger.info(message.trim(), { type: 'request' });
				},
			},
		}),
	);
}
