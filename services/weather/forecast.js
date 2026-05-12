//! services/weather/forecast.js

import env from '../../config/dotenv.js';

const OPENWEATHER_FORECAST_URL =
	'https://api.openweathermap.org/data/2.5/forecast';
const FORECAST_DAYS = 5;

export class OpenWeatherConfigError extends Error {
	constructor(message = 'OpenWeather API key is not configured') {
		super(message);
		this.name = 'OpenWeatherConfigError';
	}
}

export class OpenWeatherRateLimitError extends Error {
	constructor(message = 'OpenWeather forecast rate limit reached') {
		super(message);
		this.name = 'OpenWeatherRateLimitError';
		this.status = 429;
	}
}

function getLanguage(locale) {
	return String(locale || 'en').split('-')[0];
}

function round(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.round(number) : null;
}

function getCountryName(countryCode, locale) {
	if (!countryCode) return '';

	try {
		const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
		return displayNames.of(countryCode) || countryCode;
	} catch {
		return countryCode;
	}
}

function getLocalDateKey(timestamp, timezoneOffset) {
	return new Date((timestamp + timezoneOffset) * 1000)
		.toISOString()
		.slice(0, 10);
}

function getLocalHour(timestamp, timezoneOffset) {
	return new Date((timestamp + timezoneOffset) * 1000).getUTCHours();
}

function formatTime(timestamp, timezoneOffset, locale) {
	return new Intl.DateTimeFormat(locale, {
		hour: 'numeric',
		minute: '2-digit',
		timeZone: 'UTC',
	}).format(new Date((timestamp + timezoneOffset) * 1000));
}

function getDayLabel(index) {
	if (index === 0) return { labelKey: 'today' };
	if (index === 1) return { labelKey: 'tomorrow' };

	return {
		labelKey: 'day',
		dayNumber: index + 1,
	};
}

function getWeatherIcon(weatherMain, weatherId) {
	if (weatherId >= 200 && weatherId < 300) return 'bi-cloud-lightning-rain-fill';
	if (weatherId >= 300 && weatherId < 600) return 'bi-cloud-rain-heavy-fill';
	if (weatherId >= 600 && weatherId < 700) return 'bi-cloud-snow-fill';
	if (weatherId >= 700 && weatherId < 800) return 'bi-cloud-haze2-fill';
	if (weatherId === 800) return 'bi-sun-fill';
	if (weatherId > 800) return 'bi-cloud-sun-fill';

	const condition = String(weatherMain || '').toLowerCase();
	if (condition.includes('rain')) return 'bi-cloud-rain-heavy-fill';
	if (condition.includes('snow')) return 'bi-cloud-snow-fill';
	if (condition.includes('thunder')) return 'bi-cloud-lightning-rain-fill';
	if (condition.includes('cloud')) return 'bi-cloud-sun-fill';

	return 'bi-cloud-fill';
}

function getConditionName(weatherMain) {
	const condition = String(weatherMain || '').toLowerCase();

	if (condition.includes('thunder')) return 'stormy';
	if (condition.includes('snow')) return 'snowy';
	if (condition.includes('rain') || condition.includes('drizzle')) return 'rainy';
	if (condition.includes('cloud')) return 'cloudy';
	if (condition.includes('clear')) return 'sunny';
	if (condition.includes('mist') || condition.includes('fog')) return 'foggy';

	return condition || 'weather';
}

function getMascotImage(condition) {
	const supportedConditions = new Set(['sunny', 'cloudy', 'rainy', 'stormy', 'snowy']);
	const mascotCondition = supportedConditions.has(condition) ? condition : 'default';

	return `/images/weather/maple-coder-weather-${mascotCondition}.png`;
}

function getWindSpeed(value, unit) {
	const speed = Number(value);
	if (!Number.isFinite(speed)) return null;

	return unit === 'metric' ? round(speed * 3.6) : round(speed);
}

function getVisibility(value, unit) {
	const visibility = Number(value);
	if (!Number.isFinite(visibility)) return null;

	return unit === 'metric' ? round(visibility / 1000) : round(visibility / 1609.344);
}

function getDirection(degrees) {
	const value = Number(degrees);
	if (!Number.isFinite(value)) return '';

	const directions = [
		'N',
		'NE',
		'E',
		'SE',
		'S',
		'SW',
		'W',
		'NW',
	];
	const index = Math.round(value / 45) % directions.length;

	return directions[index];
}

function getRepresentativeEntry(entries, timezoneOffset) {
	return entries.reduce((selected, entry) => {
		const selectedDistance = Math.abs(getLocalHour(selected.dt, timezoneOffset) - 12);
		const entryDistance = Math.abs(getLocalHour(entry.dt, timezoneOffset) - 12);

		return entryDistance < selectedDistance ? entry : selected;
	}, entries[0]);
}

function sumVolume(entries, key) {
	return entries.reduce((total, entry) => {
		const volume = Number(entry?.[key]?.['3h']);
		return total + (Number.isFinite(volume) ? volume : 0);
	}, 0);
}

function serializeDay(entries, index, { locale, unit, timezoneOffset, sunrise, sunset }) {
	const representative = getRepresentativeEntry(entries, timezoneOffset);
	const weather = representative.weather?.[0] || {};
	const rainVolume = sumVolume(entries, 'rain');
	const snowVolume = sumVolume(entries, 'snow');
	const condition = getConditionName(weather.main);
	const label = getDayLabel(index);

	return {
		id: label.labelKey === 'day' ? `day-${label.dayNumber}` : label.labelKey,
		...label,
		condition: weather.main || condition,
		icon: getWeatherIcon(weather.main, weather.id),
		temp: round(representative.main?.temp),
		feelsLike: round(representative.main?.feels_like),
		high: round(Math.max(...entries.map((entry) => Number(entry.main?.temp_max)))),
		low: round(Math.min(...entries.map((entry) => Number(entry.main?.temp_min)))),
		pressure: round(representative.main?.pressure),
		cloudiness: round(representative.clouds?.all),
		visibility: getVisibility(representative.visibility, unit),
		visibilityUnit: unit === 'metric' ? 'km' : 'mi',
		sunrise: formatTime(sunrise, timezoneOffset, locale),
		sunset: formatTime(sunset, timezoneOffset, locale),
		windDirection: getDirection(representative.wind?.deg),
		windGust: getWindSpeed(representative.wind?.gust, unit),
		windUnit: unit === 'metric' ? 'km/h' : 'mph',
		precipitation:
			rainVolume > 0 || snowVolume > 0
				? {
						type: snowVolume > rainVolume ? 'snow' : 'rain',
						volume: Math.round(Math.max(rainVolume, snowVolume) * 10) / 10,
					}
				: null,
		description: weather.description || '',
		summary: weather.description || weather.main || '',
		humidity: round(representative.main?.humidity),
		wind: getWindSpeed(representative.wind?.speed, unit),
		backgroundImage: '',
		mascotImage: getMascotImage(condition),
	};
}

function serializeForecast(data, { locale, unit }) {
	const timezoneOffset = Number(data.city?.timezone) || 0;
	const groupedEntries = new Map();

	for (const entry of data.list || []) {
		const dateKey = getLocalDateKey(entry.dt, timezoneOffset);
		const entries = groupedEntries.get(dateKey) || [];

		entries.push(entry);
		groupedEntries.set(dateKey, entries);
	}

	const forecastDays = [...groupedEntries.values()]
		.slice(0, FORECAST_DAYS)
		.map((entries, index) =>
			serializeDay(entries, index, {
				locale,
				unit,
				timezoneOffset,
				sunrise: data.city?.sunrise,
				sunset: data.city?.sunset,
			}),
		);

	const countryCode = data.city?.country || '';

	return {
		location: {
			city: data.city?.name || '',
			state: '',
			country: getCountryName(countryCode, locale),
			countryCode,
		},
		forecastDays,
	};
}

export async function getWeatherForecast({ latitude, longitude, unit, locale }) {
	if (!env.OPENWEATHER_API_KEY) {
		throw new OpenWeatherConfigError();
	}

	const params = new URLSearchParams({
		lat: String(latitude),
		lon: String(longitude),
		units: unit,
		lang: getLanguage(locale),
		appid: env.OPENWEATHER_API_KEY,
	});

	const response = await fetch(`${OPENWEATHER_FORECAST_URL}?${params}`);

	if (response.status === 429) {
		throw new OpenWeatherRateLimitError();
	}

	if (!response.ok) {
		throw new Error(`OpenWeather forecast failed: ${response.status}`);
	}

	return serializeForecast(await response.json(), { locale, unit });
}
