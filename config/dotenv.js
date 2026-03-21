//! config/dotenv.js

/**
 * Normalized environment configuration
 *
 * Responsibilities:
 * - Read application environment variables through helper functions
 * - Convert raw string values into normalized application-friendly values
 * - Expose a single configuration object for the rest of the app
 *
 * Why this file exists:
 * - Keeps raw `process.env` access out of the codebase
 * - Centralizes defaults, required values, and type conversion
 * - Makes configuration easier to maintain, validate, and test
 *
 * Notes:
 * - Required values should use `requireEnv()`
 * - Optional values should use `optionalEnv()`
 * - Type normalization (e.g. number / boolean) should happen here
 */

import { requireEnv, optionalEnv } from '../utils/dotenv.js';

/**
 * Application environment configuration
 */
const env = {
	/** Current application environment */
	NODE_ENV: optionalEnv('NODE_ENV', 'development'),

	/** Port where the Express server will listen */
	PORT: Number(optionalEnv('PORT', 3000)),

	/** Base URL used for server/client references */
	CLIENT_URL: optionalEnv('CLIENT_URL', 'http://localhost:3000'),

	/** Sentry Data Source Name used for remote error monitoring */
	SENTRY_DSN: optionalEnv('SENTRY_DSN', ''),

	/** Secret used to sign session cookies */
	SESSION_SECRET: requireEnv('SESSION_SECRET'),

	/** Admin email address */
	EMAIL: requireEnv('EMAIL'),

	/** PostgreSQL host */
	DB_HOST: optionalEnv('DB_HOST', 'localhost'),

	/** PostgreSQL port */
	DB_PORT: Number(optionalEnv('DB_PORT', 5432)),

	/** PostgreSQL database name */
	DB_NAME: optionalEnv('DB_NAME', 'dwd_ejs'),

	/** PostgreSQL username */
	DB_USER: optionalEnv('DB_USER', 'postgres'),

	/** PostgreSQL password */
	DB_PASSWORD: requireEnv('DB_PASSWORD'),

	/** Whether PostgreSQL SSL is enabled */
	DB_SSL: optionalEnv('DB_SSL', 'false') === 'true',
};

export default env;
