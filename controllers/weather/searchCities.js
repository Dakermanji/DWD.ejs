//! controllers/weather/searchCities.js

import logger from '../../config/logger.js';
import {
	checkExternalApiQuota,
	recordExternalApiRequest,
} from '../../services/apiUsage/quota.js';
import { getLocale } from '../../services/i18n/locale.js';
import {
	GeocodingRateLimitError,
	searchGeocodingCities,
} from '../../services/weather/geocoding.js';

const CITY_SEARCH_PROVIDER = 'geolocation';
const CITY_SEARCH_REQUEST_KEY = 'city_search';

function normalizeSearch(value) {
	return String(value || '')
		.trim()
		.toLocaleLowerCase();
}

export async function searchCities(req, res) {
	const query = normalizeSearch(req.query?.query);

	if (query.length < 3) {
		return res.json({
			ok: true,
			cities: [],
		});
	}

	try {
		const quota = await checkExternalApiQuota(req, {
			provider: CITY_SEARCH_PROVIDER,
			requestKey: CITY_SEARCH_REQUEST_KEY,
		});

		if (!quota.allowed) {
			return res.status(429).json({
				ok: false,
				error: 'weather:error.api_limit_reached',
				retryAt: quota.retryAt?.toISOString() || null,
				window: quota.window,
				cities: [],
			});
		}

		const cities = await searchGeocodingCities(query, {
			locale: getLocale(req),
			limit: 10,
		});

		await recordExternalApiRequest(req, {
			provider: CITY_SEARCH_PROVIDER,
			requestKey: CITY_SEARCH_REQUEST_KEY,
			responseStatus: 200,
		});

		return res.json({
			ok: true,
			cities,
		});
	} catch (error) {
		if (error instanceof GeocodingRateLimitError) {
			await recordExternalApiRequest(req, {
				provider: CITY_SEARCH_PROVIDER,
				requestKey: CITY_SEARCH_REQUEST_KEY,
				responseStatus: 429,
				errorCode: 'upstream_rate_limit',
			});

			return res.status(429).json({
				ok: false,
				error: 'weather:error.api_limit_reached',
				cities: [],
			});
		}

		logger.error('Weather city search failed', {
			type: 'weather',
			error: error.message,
		});

		return res.status(503).json({
			ok: false,
			error: 'weather:error.city_search_failed',
			cities: [],
		});
	}
}
