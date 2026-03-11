//! config/process.js

/**
 * Process-Level Error Handlers
 *
 * Registers global Node.js process event listeners
 * for unexpected application failures.
 */

import logger from './logger.js';

/**
 * Registers global process-level error and shutdown handlers.
 *
 * @param {import('http').Server} server - Node.js HTTP server instance
 */
export default function registerProcessHandlers(server) {
	/**
	 * Catches synchronous exceptions that were not handled anywhere else.
	 * This usually means the app is in an unsafe state and should exit immediately.
	 */
	process.on('uncaughtException', (error) => {
		logger.fatal(error.stack || error.message, { type: 'system' });
		process.exit(1);
	});

	/**
	 * Catches rejected Promises that were not awaited or wrapped.
	 * This may leave the application in an unstable state, so exit safely.
	 */
	process.on('unhandledRejection', (reason) => {
		const message =
			reason instanceof Error
				? reason.stack || reason.message
				: String(reason);

		logger.fatal(`Unhandled promise rejection: ${message}`, {
			type: 'system',
		});

		process.exit(1);
	});

	/**
	 * SIGTERM is commonly sent by cloud providers and process managers.
	 * Attempt a graceful shutdown before exiting.
	 */
	process.on('SIGTERM', () => {
		logger.info('SIGTERM received. Shutting down gracefully.', {
			type: 'system',
		});

		server.close(() => process.exit(0));
	});

	/**
	 * SIGINT is triggered locally when pressing Ctrl+C.
	 * Handle it the same way as SIGTERM.
	 */
	process.on('SIGINT', () => {
		logger.info('SIGINT received. Shutting down gracefully.', {
			type: 'system',
		});

		server.close(() => process.exit(0));
	});
}
