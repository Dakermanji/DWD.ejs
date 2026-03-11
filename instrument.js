//! instrument.js;

/**
 * Sentry Instrumentation Bootstrap
 *
 * Initializes Sentry as early as possible so automatic instrumentation
 * and global error handlers are registered before the application loads.
 */

import env from './config/dotenv.js';
import * as Sentry from '@sentry/node';

Sentry.init({
	dsn: env.SENTRY_DSN,

	// Sends request data such as headers and IP when relevant.
	// Review this before enabling in production if privacy rules matter.
	sendDefaultPii: true,

	// Keep tracing off for now until we explicitly want performance monitoring.
	// tracesSampleRate: 1.0,
});
