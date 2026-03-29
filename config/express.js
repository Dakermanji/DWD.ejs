//! config/express.js

/**
 * Express Application Configuration
 *
 * Creates and configures the Express application instance.
 * This file is responsible for:
 * - Initializing the app
 * - Applying global middleware
 * - Registering routes
 * - Preparing the app for startup
 */

import express from 'express';

import './mailer.js';
import configureViews from './views.js';
import applyMiddlewares from './middlewares.js';
import router from './routes.js';
import applyErrorHandlers from './errorHandlers.js';

const app = express();

// Trust the first proxy layer.
// Useful when deploying behind reverse proxies such as Nginx or hosting platforms.
app.set('trust proxy', 1);

// Configure EJS view engine and register the views directory
configureViews(app);

// Register global middlewares.
applyMiddlewares(app);

// Register application routes.
app.use('/', router);

// Register global error handlers.
applyErrorHandlers(app);

export default app;
