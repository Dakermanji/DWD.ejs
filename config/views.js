//! config/views.js

/**
 * View Engine Configuration
 *
 * Configures the template engine used by the application.
 *
 * Responsibilities:
 * - Register the view engine used for rendering templates
 * - Define the directory where view templates are stored
 *
 * The project uses EJS (Embedded JavaScript Templates) to render
 * dynamic HTML pages on the server.
 *
 * Example usage inside routes:
 * res.render('home', { title: 'Home Page' });
 */

import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Resolve the current file path in ES Modules.
 * Node.js does not provide __dirname by default in ES module mode,
 * so we recreate it using fileURLToPath.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Applies view engine configuration to the Express application.
 *
 * @param {import('express').Express} app - Express application instance
 */
export default function configureViews(app) {
	/**
	 * Register EJS as the application's template engine.
	 */
	app.set('view engine', 'ejs');

	/**
	 * Define the directory where template files are located.
	 * The path is resolved relative to the project root.
	 */
	app.set('views', path.join(__dirname, '../views'));
}
