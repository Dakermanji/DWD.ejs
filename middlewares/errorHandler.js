//! middlewares/errorHandler.js

import logger from '../config/logger.js';
import env from '../config/dotenv.js';

export default function errorHandler(err, req, res, next) {
	const status = err.status || 500;

	logger.error(err.message, { type: 'server' });

	res.status(status).render('error', {
		status,
		title: status === 404 ? 'Not Found' : 'Server Error',
		message:
			status === 404
				? 'The requested page could not be found.'
				: 'Something went wrong.',
		stack: err.stack,
		env: env.NODE_ENV,
	});
}
