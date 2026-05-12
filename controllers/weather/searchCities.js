//! controllers/weather/searchCities.js

import logger from '../../config/logger.js';
import { getLocale } from '../../services/i18n/locale.js';
import { searchGeocodingCities } from '../../services/weather/geocoding.js';

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
		const cities = await searchGeocodingCities(query, {
			locale: getLocale(req),
			limit: 10,
		});

		return res.json({
			ok: true,
			cities,
		});
	} catch (error) {
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
