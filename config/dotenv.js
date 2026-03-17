//! config/dotenv.js

/**
 * Environment Configuration Loader
 *
 * Loads environment variables from the `.env` file using dotenv
 * and exposes a normalized configuration object for the application.
 *
 * Why this file exists:
 * - Centralizes environment variable access
 * - Provides safe fallback defaults
 * - Prevents direct usage of `process.env` across the codebase
 * - Makes configuration easier to maintain and test
 */

import dotenv from 'dotenv';

// Load variables from .env file into process.env
dotenv.config({ quiet: true });

/**
 * Normalized environment configuration
 *
 * Each variable includes a fallback value so the
 * application can still run if the variable is not defined.
 */
const env = {
	/** Current application environment */
	NODE_ENV: process.env.NODE_ENV ?? 'development',

	/** Port where the Express server will listen */
	PORT: process.env.PORT ?? 3000,

	/** Base URL used for server/client references */
	CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:3000',

	/** Sentry Data Source Name used for remote error monitoring */
	SENTRY_DSN: process.env.SENTRY_DSN ?? '',

	/** Secret used to sign session cookies */
	SESSION_SECRET: process.env.SESSION_SECRET ?? 'development-secret',

	/** Admin Email */
	EMAIL: process.env.EMAIL,
};

export default env;
