//! controllers/weather/main.js

import logger from '../../config/logger.js';
import {
	checkExternalApiQuota,
	recordExternalApiRequest,
} from '../../services/apiUsage/quota.js';
import { fail } from '../../services/http/response.js';
import { getLocale } from '../../services/i18n/locale.js';
import {
	getWeatherForecast,
	OpenWeatherConfigError,
	OpenWeatherRateLimitError,
} from '../../services/weather/forecast.js';

const WEATHER_PROVIDER = 'weather';
const WEATHER_REQUEST_KEY = 'forecast';
const WEATHER_REDIRECT = '/weather';

const emptyLocation = {
	city: '',
	state: '',
	country: '',
	countryCode: '',
};

function renderWeatherView(req, res, { location = emptyLocation, forecastDays = [] } = {}) {
	res.render('weather/main', {
		titleKey: 'weather:title',
		styles: ['weather/main'],
		scripts: ['weather/main'],
		location,
		unit: req.weather?.unit || 'metric',
		forecastDays,
	});
}

export async function renderWeather(req, res) {
	if (
		typeof req.weather?.latitude !== 'number' ||
		typeof req.weather?.longitude !== 'number'
	) {
		return renderWeatherView(req, res);
	}

	try {
		const quota = await checkExternalApiQuota(req, {
			provider: WEATHER_PROVIDER,
			requestKey: WEATHER_REQUEST_KEY,
		});

		if (!quota.allowed) {
			return fail(req, res, 'weather:error.api_limit_reached', {
				to: WEATHER_REDIRECT,
			});
		}

		const forecast = await getWeatherForecast({
			latitude: req.weather.latitude,
			longitude: req.weather.longitude,
			unit: req.weather.unit,
			locale: getLocale(req),
		});

		await recordExternalApiRequest(req, {
			provider: WEATHER_PROVIDER,
			requestKey: WEATHER_REQUEST_KEY,
			responseStatus: 200,
		});

		return renderWeatherView(req, res, forecast);
	} catch (error) {
		if (error instanceof OpenWeatherRateLimitError) {
			await recordExternalApiRequest(req, {
				provider: WEATHER_PROVIDER,
				requestKey: WEATHER_REQUEST_KEY,
				responseStatus: 429,
				errorCode: 'upstream_rate_limit',
			});

			return fail(req, res, 'weather:error.api_limit_reached', {
				to: WEATHER_REDIRECT,
			});
		}

		const flashKey =
			error instanceof OpenWeatherConfigError
				? 'weather:error.api_not_configured'
				: 'weather:error.forecast_failed';

		logger.error('Weather forecast failed', {
			type: 'weather',
			error: error.message,
		});

		return fail(req, res, flashKey, {
			to: WEATHER_REDIRECT,
		});
	}
}
