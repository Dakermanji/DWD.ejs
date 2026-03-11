//! middlewares/staticFiles.js

/**
 * Static Files Middleware
 *
 * Serves public assets directly through Express.
 *
 * Static files include:
 * - CSS stylesheets
 * - JavaScript files
 * - Images
 * - Fonts
 * - Client-side libraries
 *
 * These assets are stored in the project's `public` directory
 * and are accessible directly by the browser.
 *
 * Example:
 * /public/css/style.css  →  http://localhost:3000/css/style.css
 */

import express from 'express';

/**
 * Registers the static file middleware.
 *
 * @param {import('express').Express} app - Express application instance
 */
export default function staticFiles(app) {
	/**
	 * Serve files from the "public" directory.
	 * Express will automatically map file paths to URLs.
	 */
	app.use(express.static('public'));
}
