//! middlewares/parsers.js

/**
 * Request Body Parsers
 *
 * Registers middleware responsible for parsing incoming request bodies.
 *
 * These parsers allow Express to automatically interpret:
 * - JSON payloads from APIs
 * - URL-encoded data from HTML forms
 *
 * Security note:
 * A size limit is applied to protect the application from
 * excessively large payloads that could be used in abuse or
 * denial-of-service scenarios.
 */

import express from 'express';

/**
 * Applies request body parsers to the application.
 *
 * @param {import('express').Express} app - Express application instance
 */
export default function parsers(app) {
	/**
	 * Parse JSON request bodies.
	 *
	 * Example:
	 * POST /api
	 * { "name": "Dakermanji" }
	 */
	app.use(express.json({ limit: '10kb' }));

	/**
	 * Parse URL-encoded form submissions.
	 *
	 * Example form submission:
	 * name=John&email=john@example.com
	 *
	 * `extended: true` allows nested objects in the payload.
	 */
	app.use(express.urlencoded({ extended: true, limit: '10kb' }));
}
