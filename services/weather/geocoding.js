//! services/weather/geocoding.js

const OPEN_METEO_GEOCODING_URL =
	'https://geocoding-api.open-meteo.com/v1/search';
const MAX_GEOCODING_RESULTS = 10;

export class GeocodingRateLimitError extends Error {
	constructor(message = 'Open-Meteo geocoding rate limit reached') {
		super(message);
		this.name = 'GeocodingRateLimitError';
		this.status = 429;
	}
}

function normalizeLimit(limit) {
	const normalizedLimit = Number(limit);

	if (!Number.isInteger(normalizedLimit)) {
		return MAX_GEOCODING_RESULTS;
	}

	return Math.min(Math.max(normalizedLimit, 1), MAX_GEOCODING_RESULTS);
}

function normalizeLanguage(locale) {
	return String(locale || 'en')
		.split('-')[0]
		.toLocaleLowerCase();
}

function getCountryName(countryCode, locale) {
	if (!countryCode) return '';

	try {
		return (
			new Intl.DisplayNames([locale || 'en'], { type: 'region' }).of(
				countryCode,
			) || countryCode
		);
	} catch {
		return countryCode;
	}
}

function getStateName(city) {
	return (
		city.admin1 ||
		city.admin2 ||
		city.admin3 ||
		city.admin4 ||
		''
	);
}

function serializeCity(city, locale) {
	const state = getStateName(city);
	const country = getCountryName(city.country_code, locale);
	const language = String(locale).split('-')[0];
	const comma = language === 'ar' ? '، ' : ', ';

	return {
		city: city.name || '',
		state,
		country,
		countryCode: city.country_code || '',
		latitude: city.latitude,
		longitude: city.longitude,
		population: city.population || 0,
		timezone: city.timezone || '',
		label: [city.name, state, country].filter(Boolean).join(comma),
	};
}

function sortCities(cities, query) {
	const normalizedQuery = String(query || '').toLocaleLowerCase();

	return [...cities].sort((a, b) => {
		const aName = String(a.city || '').toLocaleLowerCase();
		const bName = String(b.city || '').toLocaleLowerCase();
		const aExact = aName === normalizedQuery ? 1 : 0;
		const bExact = bName === normalizedQuery ? 1 : 0;
		const aPrefix = aName.startsWith(normalizedQuery) ? 1 : 0;
		const bPrefix = bName.startsWith(normalizedQuery) ? 1 : 0;

		return (
			(b.population || 0) - (a.population || 0) ||
			bExact - aExact ||
			bPrefix - aPrefix ||
			aName.localeCompare(bName)
		);
	});
}

function getDistanceScore(city, latitude, longitude) {
	const cityLatitude = Number(city.latitude);
	const cityLongitude = Number(city.longitude);

	if (
		!Number.isFinite(cityLatitude) ||
		!Number.isFinite(cityLongitude)
	) {
		return Number.POSITIVE_INFINITY;
	}

	return Math.abs(cityLatitude - latitude) + Math.abs(cityLongitude - longitude);
}

export async function searchGeocodingCities(
	query,
	{ locale = 'en', limit = 5 } = {},
) {
	const normalizedLimit = normalizeLimit(limit);
	const params = new URLSearchParams({
		name: query,
		count: String(normalizedLimit),
		language: normalizeLanguage(locale),
		format: 'json',
	});

	const response = await fetch(`${OPEN_METEO_GEOCODING_URL}?${params}`);

	if (response.status === 429) {
		throw new GeocodingRateLimitError();
	}

	if (!response.ok) {
		throw new Error(`Open-Meteo geocoding failed: ${response.status}`);
	}

	const data = await response.json();
	const cities = Array.isArray(data?.results) ? data.results : [];

	return sortCities(
		cities.map((city) => serializeCity(city, locale)),
		query,
	).slice(0, normalizedLimit);
}

export async function findGeocodingCityByCoordinates(
	query,
	{ latitude, longitude, locale = 'en', countryCode = '' } = {},
) {
	const cities = await searchGeocodingCities(query, {
		locale,
		limit: MAX_GEOCODING_RESULTS,
	});
	const normalizedCountryCode = String(countryCode || '').toLocaleUpperCase();
	const matchingCountryCities = normalizedCountryCode
		? cities.filter((city) => city.countryCode === normalizedCountryCode)
		: cities;
	const candidates = matchingCountryCities.length ? matchingCountryCities : cities;

	return [...candidates].sort(
		(a, b) =>
			getDistanceScore(a, latitude, longitude) -
			getDistanceScore(b, latitude, longitude),
	)[0] || null;
}
