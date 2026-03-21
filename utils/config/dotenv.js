//! utils/config/dotenv.js

/**
 * Environment variable helpers
 *
 * Responsibilities:
 * - Load variables from the `.env` file into `process.env`
 * - Provide strict access for required variables
 * - Provide safe access for optional variables with fallback defaults
 *
 * Why this file exists:
 * - Prevent repeated raw access to `process.env`
 * - Centralize environment validation rules
 * - Fail fast when critical configuration is missing
 * - Warn during development when optional values are not provided
 */

import dotenv from 'dotenv';
import logger from '../../config/logger.js';

// Load variables from .env file into process.env
dotenv.config({ quiet: true });

/**
 * Get a required environment variable
 *
 * A required variable must exist and must not be an empty string.
 * If the variable is missing, the app should fail immediately.
 *
 * @param {string} key - Environment variable name
 * @returns {string}
 *
 * @throws {Error} If the variable is missing or empty
 */
export function requireEnv(key) {
	const value = process.env[key];

	if (value === undefined || value === '') {
		throw new Error(`[ENV] Missing required environment variable: ${key}`);
	}

	return value;
}

/**
 * Get an optional environment variable
 *
 * If the variable is missing or empty:
 * - return the provided fallback value
 * - log a warning in non-production environments
 *
 * @template T
 * @param {string} key - Environment variable name
 * @param {T} defaultValue - Fallback value
 * @returns {string | T}
 */
export function optionalEnv(key, defaultValue) {
	const value = process.env[key];
	const isMissing = value === undefined || value === '';

	if (isMissing && process.env.NODE_ENV !== 'production') {
		logger.warn(`Environment variable not set: ${key}`, {
			type: 'env',
		});
	}

	return isMissing ? defaultValue : value;
}
